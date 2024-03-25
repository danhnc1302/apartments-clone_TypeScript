package routes

import (
	"github.com/kataras/iris/v12"
	"golang.org/x/crypto/bcrypt"
	"apartments-clone-server/models"
	"apartments-clone-server/storage"
	"apartments-clone-server/utils"
	"strings"	
	"io/ioutil"
	"log"
	"encoding/json"
	"net/http"
)

func Register(ctx iris.Context) {
	var userInput RegisterUserInput
	err := ctx.ReadJSON(&userInput)
	if err != nil {
		utils.HandleValidationErrors(err, ctx)
		return
	}

	var newUser models.User
	userExists, userExistsErr := getAndHandleUserExists(&newUser, userInput.Email)
	if userExistsErr != nil {
		utils.CreateInternalServerError(ctx)
		return
	}

	if userExists == true {
		utils.CreateEmailAlreadyRegistered(ctx)
		return
	}

	hashedPassword, hashErr := hashAndSaltPassword(userInput.Password)
	if hashErr != nil {
		utils.CreateInternalServerError(ctx)
		return
	}

	newUser = models.User{
		FirstName:   userInput.FirstName,
		LastName:    userInput.LastName,
		Email:       strings.ToLower(userInput.Email),
		Password:    hashedPassword,
		SocialLogin: false}

	storage.DB.Create(&newUser)

	returnUser(newUser, ctx)
}	


func Login(ctx iris.Context) {
	var userInput LoginUserInput
	err := ctx.ReadJSON(&userInput)
	if err != nil {
		utils.HandleValidationErrors(err, ctx)
		return
	}

	var existingUser models.User
	errorMsg := "Invalid email or password."
	userExists, userExistsErr := getAndHandleUserExists(&existingUser, userInput.Email)
	if userExistsErr != nil {
		utils.CreateInternalServerError(ctx)
		return
	}

	if userExists == false {
		utils.CreateError(iris.StatusUnauthorized, "Credentials Error", errorMsg, ctx)
		return
	}

	if existingUser.SocialLogin == true {
		utils.CreateError(iris.StatusUnauthorized, "Credentials Error", "Social Login Account", ctx)
		return
	}

	passwordErr := bcrypt.CompareHashAndPassword([]byte(existingUser.Password), []byte(userInput.Password))
	if passwordErr != nil {
		utils.CreateError(iris.StatusUnauthorized, "Credentials Error", errorMsg, ctx)
		return
	}

	ctx.JSON(iris.Map{
		"ID": existingUser.ID,
		"firstName": existingUser.FirstName,
		"lastName": existingUser.LastName,
		"email": existingUser.Email,
	})

	returnUser(existingUser, ctx)
}



func returnUser(user models.User, ctx iris.Context) {
	// tokenPair, tokenErr := utils.CreateTokenPair(user.ID)
	// if tokenErr != nil {
	// 	utils.CreateInternalServerError(ctx)
	// 	return
	// }

	ctx.JSON(iris.Map{
		"ID":                  user.ID,
		"firstName":           user.FirstName,
		"lastName":            user.LastName,
		"email":               user.Email,
		// "savedProperties":     user.SavedProperties,
		// "allowsNotifications": user.AllowsNotifications,
		// "accessToken":         string(tokenPair.AccessToken),
		// "refreshToken":        string(tokenPair.RefreshToken),
	})

}

func GoogleLoginOrSignUp(ctx iris.Context) {
	var userInput FacebookOrGoogleUserInput
	err := ctx.ReadJSON(&userInput)
	if err != nil {
		utils.HandleValidationErrors(err, ctx)
		return
	}

	endpoint := "https://www.googleapis.com/userinfo/v2/me"

	client := &http.Client{}
	req, _ := http.NewRequest("GET", endpoint, nil)
	header := "Bearer " + userInput.AccessToken
	req.Header.Set("Authorization", header)
	res, googleErr := client.Do(req)
	if googleErr != nil {
		utils.CreateInternalServerError(ctx)
		return
	}

	defer res.Body.Close()
	body, bodyErr := ioutil.ReadAll(res.Body)
	if bodyErr != nil {
		log.Panic(bodyErr)
		utils.CreateInternalServerError(ctx)
		return
	}

	var googleBody GoogleUserRes
	json.Unmarshal(body, &googleBody)

	if googleBody.Email != "" {
		var user models.User
		userExists, userExistsErr := getAndHandleUserExists(&user, googleBody.Email)

		if userExistsErr != nil {
			utils.CreateInternalServerError(ctx)
			return
		}

		if userExists == false {
			user = models.User{FirstName: googleBody.GivenName, LastName: googleBody.FamilyName, Email: googleBody.Email, SocialLogin: true, SocialProvider: "Google"}
			storage.DB.Create(&user)

			returnUser(user, ctx)
			return
		}

		if user.SocialLogin == true && user.SocialProvider == "Google" {
			returnUser(user, ctx)
			return
		}

		utils.CreateEmailAlreadyRegistered(ctx)
		return

	}
}


func FacebookLoginOrSignUp(ctx iris.Context) {
	var userInput FacebookOrGoogleUserInput

	err := ctx.ReadJSON(&userInput)
	if err != nil {
		utils.HandleValidationErrors(err, ctx)
		return
	}
	endpoint := "https://graph.facebook.com/me?fields=id,name,email&access_token=" + userInput.AccessToken
	client := &http.Client{}
	req, _ := http.NewRequest("GET", endpoint, nil)
	
	res, facebookErr := client.Do(req)
	if facebookErr != nil {
		utils.CreateInternalServerError(ctx)
		return
	}

	defer res.Body.Close()
	body, bodyErr := ioutil.ReadAll(res.Body)
	if bodyErr != nil {
		log.Panic(bodyErr)
		utils.CreateInternalServerError(ctx)
		return
	}

	var facebookBody FacebookUserRes
	json.Unmarshal(body, &facebookBody)

	if facebookBody.Email != "" {
		var user models.User
		userExists, userExistsErr := getAndHandleUserExists(&user, facebookBody.Email)

		if userExistsErr != nil {
			utils.CreateInternalServerError(ctx)
			return
		}

		if userExists == false {
			nameArr := strings.SplitN(facebookBody.Name, " ", 2)
			user = models.User{FirstName: nameArr[0], LastName: nameArr[1], Email: facebookBody.Email, SocialLogin: true, SocialProvider: "Facebook"}
			storage.DB.Create(&user)

			returnUser(user, ctx)
			return
		}

		if user.SocialLogin == true && user.SocialProvider == "Facebook" {
			returnUser(user, ctx)
			return
		}

		utils.CreateEmailAlreadyRegistered(ctx)
		return
	}
}

func hashAndSaltPassword(password string) (hashedPassword string, err error) {
	bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}

	return string(bytes), nil
}

func getAndHandleUserExists(user *models.User, email string) (exists bool, err error) {
	userExistsQuery := storage.DB.Where("email = ?", strings.ToLower(email)).Limit(1).Find(&user)

	if userExistsQuery.Error != nil {
		return false, userExistsQuery.Error
	}

	userExists := userExistsQuery.RowsAffected > 0

	if userExists == true {
		return true, nil
	}

	return false, nil
}

type RegisterUserInput struct {
	FirstName 		string `json:"firstName" validate:"required,max=256"`
	LastName  		string `json:"lastName" validate:"required,max=256"`
	Email     		string `json:"email" validate:"required,max=256,email"`
	Password  		string `json:"password" validate:"required,min=8,max=256"`
}

type LoginUserInput struct {
	Email    		string `json:"email" validate:"required,email"`
	Password 		string `json:"password" validate:"required"`
}

type FacebookOrGoogleUserInput struct {
	AccessToken 	string `json:"accessToken" validate:"required"`
}

type FacebookUserRes struct {
	ID 				string `json:"id"`
	Name 			string `json:"name"`
	Email 			string `json:"email"`
}

type GoogleUserRes struct {
	ID				string `json:"id"`
	Email			string `json:"email"`
	Name			string `json:"name"`
	GivenName		string `json:"given_name"`
	FamilyName		string `json:"family_name"`
}