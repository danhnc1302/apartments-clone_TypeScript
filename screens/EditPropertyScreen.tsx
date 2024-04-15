import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,

} from "react-native";
import { Text, Button } from "@ui-kitten/components";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from "react-query";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Formik } from "formik";
import RNPhoneInput from "react-native-phone-number-input";
import * as yup from "yup";
import axios from "axios";

import { Loading } from "../components/Loading";
import { Screen } from "../components/Screen";
import { UnitPhotosPicker } from "../components/UnitPhotosPicker";
import { UnitAmenities } from "../components/UnitAmenities";
import { UnitDescription } from "../components/UnitDescription";
import { UnitsInput } from "../components/EditPropertySections/UnitsInput";
import { GeneralPropertyInfo } from "../components/EditPropertySections/GeneralPropertyInfo";

import { useUser } from "../hooks/useUser";

import { bedValues } from "../constants/bedValues";
import { bathValues } from "../constants/bathValues";
import {
  AMENITIES_STR,
  DESCRIPTION_STR,
  endpoints,
  PHOTOS_STR,
  queryKeys,
} from "../constants";
import { EditPropertyObj, Property } from "../types/property";
import { TempApartment } from "../types/tempApartment";
import { DescriptionInput } from "../components/DescriptionInput";
import { UtilitiesAndAmenities } from "../components/EditPropertySections/UtilitiesAndAmenities ";
import { petValues } from "../constants/petValues";
import { laundryValues } from "../constants/laundryValues";
import { ContactInfo } from "../components/EditPropertySections/ContactInfo";
import { theme } from "../theme";
import { PickerItem } from "react-native-woodpicker";

import { useEditPropertyMutation } from "../hooks/mutations/useEditPropertyMutation";
import { useLoading } from "../hooks/useLoading";
import { useNavigation } from "@react-navigation/native";

const EditPropertyScreen = ({
  route,
}: {
  route: { params: { propertyID: number } };
}) => {

  const scrollViewRef = useRef<KeyboardAwareScrollView | null>(null);
  // const editProperty = useEditPropertyMutation();
  const phoneRef = useRef<RNPhoneInput>(null);
  const [showAlternateScreen, setShowAlternateScreen] = useState("");
  const [apartmentIndex, setApartmentIndex] = useState<number>(-1);
  const { user } = useUser();

  const navigation = useNavigation()
  const { setLoading } = useLoading();
  const queryClient = useQueryClient();
  const editProperty = useMutation(
    (obj: EditPropertyObj) => axios.patch(`${endpoints.updateProperty}${route.params.propertyID}`, obj),
    {
      onMutate: () => {
        setLoading(true);
      },
      onError(err) {
        setLoading(false);
        alert("Error updating property")
      },
      onSuccess() {
        queryClient.invalidateQueries("myproperties");
        setLoading(false);
        navigation.goBack();
      }
    }

  )

  const handleShowAlternateScreen = (index: number, name: string) => {
    if (scrollViewRef.current) scrollViewRef.current.scrollToPosition(0, 0);
    setShowAlternateScreen(name);
    setApartmentIndex(index);
  };

  const handleHideAlternateScreen = () => {
    setShowAlternateScreen("");
    setApartmentIndex(-1);
  };

  const property: UseQueryResult<{ data: Property }, unknown> = useQuery(
    "property",
    () => axios.get(endpoints.getPropertyByUserId + route.params.propertyID)
  );

  const propertyData = property.data?.data;

  let initialApartments: TempApartment[] = [];
  if (propertyData) {
    for (let i of propertyData.apartments) {
      initialApartments.push({
        ID: i.ID,
        unit: i.unit ? i.unit : "",
        bedrooms: bedValues.filter((item) => item.value === i.bedrooms)[0],
        bathrooms: bathValues.filter((item) => item.value === i.bathrooms)[0],
        sqFt: i.sqFt ? i.sqFt.toString() : "",
        rent: i.rent ? i.rent.toString() : "",
        deposit: i.deposit ? i.deposit.toString() : "0",
        leaseLength: i?.leaseLength ? i.leaseLength : "12 Months",
        availableOn: i?.availableOn ? new Date(i.availableOn) : new Date(),
        active: i.active ?? true,
        showCalendar: false,
        images: i.images ? i.images : [],
        amenities: i.amenities ? i.amenities : [],
        description: i.description ? i.description : "",
      });
    }
  }



  if (property.isFetching || property.isLoading) return <Loading />

  return (
    <Screen >
      <KeyboardAwareScrollView
        bounces={false}
        ref={(ref) => (scrollViewRef.current = ref)}
        style={styles.container}
      >
        {!showAlternateScreen && (
          <Text category="h5" style={styles.header}>
            Basic Info
          </Text>
        )}
        <View>
          <Formik
            initialValues={{
              unitType: propertyData?.unitType,
              apartments: initialApartments,
              description: propertyData?.description ?? "",
              images: propertyData?.images ?? [],
              includedUtilities: propertyData?.includedUtilities ?? [],
              petsAllowed: propertyData?.petsAllowed
                ? petValues.filter(
                  (i) => i.value === propertyData.petsAllowed
                )[0]
                : petValues[0],
              laundryType: propertyData?.laundryType
                ? laundryValues.filter(
                  (i) => i.value === propertyData.laundryType
                )[0]
                : laundryValues[0],
              parkingFee: propertyData?.parkingFee?.toString() ?? "",
              amenities: propertyData?.amenities ?? [],
              name: propertyData?.name ?? "",
              firstName: propertyData?.firstName
                ? propertyData.firstName
                : user?.firstName
                  ? user.firstName
                  : "",
              lastName: propertyData?.lastName
                ? propertyData.lastName
                : user?.lastName
                  ? user.lastName
                  : "",
              email: propertyData?.email
                ? propertyData.email
                : user?.email
                  ? user.email
                  : "",
              countryCode: propertyData?.countryCode ?? "US",
              callingCode: propertyData?.callingCode ?? "",
              phoneNumber: propertyData?.phoneNumber ?? "",
              website: propertyData?.website ?? "",
              onMarket: propertyData?.onMarket ? propertyData.onMarket : false,
            }}
            validationSchema={validationSchema}
            onSubmit={(values) => {
              const callingCode = phoneRef.current?.getCallingCode();
              const countryCode = phoneRef.current?.getCountryCode();

              const newApartments = [];
              for (let i of values.apartments) {
                newApartments.push({
                  ID: i.ID,
                  unit: i.unit,
                  bedrooms: (i.bedrooms as PickerItem).value,
                  bathrooms: (i.bathrooms as PickerItem).value,
                  sqFt: Number(i.sqFt),
                  rent: Number(i.rent),
                  deposit: Number(i.deposit),
                  leaseLength: i.leaseLength,
                  availableOn: i.availableOn,
                  active: i.active,
                  images: i.images,
                  amenities: i.amenities,
                  description: i.description,
                });
              }

              const obj: EditPropertyObj = {
                ID: route.params.propertyID,
                unitType: values.unitType,
                amenities: values.amenities,
                apartments: newApartments,
                description: values.description,
                email: values.email,
                firstName: values.firstName,
                images: values.images,
                lastName: values.lastName,
                includedUtilities: values.includedUtilities,
                laundryType: values.laundryType.value,
                name: values.name,
                onMarket: values.onMarket,
                parkingFee: Number(values.parkingFee),
                petsAllowed: values.petsAllowed.value,
                callingCode,
                countryCode,
                phoneNumber: values.phoneNumber,
                website: values.website,
              };

              editProperty.mutate(obj);

            }}
          >
            {({
              values,
              errors,
              touched,
              handleSubmit,
              setFieldTouched,
              setFieldValue,
              handleChange,
            }) => {

              if (showAlternateScreen === PHOTOS_STR && apartmentIndex > -1) {
                return <UnitPhotosPicker
                  setImages={setFieldValue}
                  images={values.apartments[apartmentIndex].images}
                  field={`apartments[${apartmentIndex}].images`}
                  cancel={handleHideAlternateScreen}
                />
              }
              if (showAlternateScreen === AMENITIES_STR && apartmentIndex > -1) {
                return <UnitAmenities
                  setAmenities={setFieldValue}
                  amenities={values.apartments[apartmentIndex].amenities}
                  field={`apartments[${apartmentIndex}].amenities`}
                  cancel={handleHideAlternateScreen}
                />
              }

              if (showAlternateScreen === DESCRIPTION_STR && apartmentIndex > -1) {
                return <UnitDescription
                  setDescription={setFieldValue}
                  description={values.apartments[apartmentIndex].description}
                  field={`apartments[${apartmentIndex}].description`}
                  cancel={handleHideAlternateScreen}
                />
              }

              return (
                <>
                  <UnitsInput
                    unitType={values.unitType}
                    apartments={values.apartments}
                    property={property.data?.data}
                    touched={touched}
                    errors={errors}
                    setFieldTouched={setFieldTouched}
                    setFieldValue={setFieldValue}
                    handleChange={handleChange}
                    handleShowAlternateScreen={handleShowAlternateScreen}
                  />
                  <GeneralPropertyInfo
                    images={values.images}
                    description={values.description}
                    setFieldValue={setFieldValue}
                  />
                  <UtilitiesAndAmenities
                    amenities={values.amenities}
                    handleChange={handleChange}
                    includedUtilities={values.includedUtilities}
                    laundryType={values.laundryType}
                    parkingFee={values.parkingFee}
                    petsAllowed={values.petsAllowed}
                    setFieldValue={setFieldValue}
                  />
                  <ContactInfo
                    name={values.name}
                    email={values.email}
                    errors={errors}
                    firstName={values.firstName}
                    website={values.website}
                    handleChange={handleChange}
                    lastName={values.lastName}
                    phoneNumber={values.phoneNumber}
                    countryCode={values.countryCode}
                    phoneRef={phoneRef}
                    setFieldTouched={setFieldTouched}
                    touched={touched}
                  />
                  {Object.keys(errors).length > 0 ? (
                    <Text status={"danger"} category="label">
                      {"Check Errors Above"}
                    </Text>
                  ) : null}
                  <Button onPress={() => {
                    console.log(values)
                    return handleSubmit()
                  }} style={styles.saveButton}>
                    Save
                  </Button>
                  <Button
                    appearance={"ghost"}
                    style={[styles.publishButton]}
                    onPress={() => {
                      if (propertyData?.onMarket)
                        setFieldValue("onMarket", false);
                      else setFieldValue("onMarket", true);
                      handleSubmit();
                    }}
                  >
                    {propertyData?.onMarket
                      ? "Unpublish Listing"
                      : "Publish Listing"}
                  </Button>
                </>
              )
            }
            }
          </Formik>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
};

export default EditPropertyScreen;

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
  },
  header: {
    textAlign: "center",
    paddingVertical: 10,
  },
  saveButton: {
    borderColor: theme["color-primary-500"],
    marginVertical: 15,
  },
  publishButton: {
    borderColor: theme["color-primary-500"],
    marginBottom: 15,
  }
});

const validationSchema = yup.object().shape({
  unitType: yup.string().required(),
  apartments: yup.array().when("unitType", {
    is: "multiple",
    then: yup.array(
      yup.object().shape({
        unit: yup.string().required("Required"),
        bedrooms: yup.object().shape({
          label: yup.string().required("Required"),
          value: yup.string().required("Required"),
        }),
        bathrooms: yup.object().shape({
          label: yup.string().required("Required"),
          value: yup.string().required("Required"),
        }),
        sqFt: yup.string().required("Required"),
        rent: yup.string().required("Required"),
        deposit: yup.string().required("Required"),
        leaseLength: yup.string().required("Required"),
        availableOn: yup.date().required("Required"),
        active: yup.boolean().required("Required"),
        showCalendar: yup.boolean(),
        images: yup.array().of(yup.string()),
        amenities: yup.array().of(yup.string()),
        description: yup.string(),
      })
    ),
    otherwise: yup.array(
      yup.object().shape({
        unit: yup.string(),
        bedrooms: yup.object().shape({
          label: yup.string().required("Required"),
          value: yup.string().required("Required"),
        }),
        bathrooms: yup.object().shape({
          label: yup.string().required("Required"),
          value: yup.string().required("Required"),
        }),
        sqFt: yup.string().required("Required"),
        rent: yup.string().required("Required"),
        deposit: yup.string().required("Required"),
        leaseLength: yup.string().required("Required"),
        availableOn: yup.date().required("Required"),
        active: yup.boolean().required("Required"),
        showCalendar: yup.boolean(),
        images: yup.array().of(yup.string()),
        amenities: yup.array().of(yup.string()),
        description: yup.string(),
      })
    ),
  }),
  description: yup.string(),
  images: yup.array().of(yup.string()),
  includedUtilities: yup.array().of(yup.string()),
  petsAllowed: yup.object().shape({
    label: yup.string().required("Required"),
    value: yup.string().required("Required"),
  }),
  laundryType: yup.object().shape({
    label: yup.string().required("Required"),
    value: yup.string().required("Required"),
  }),
  parkingFee: yup.string(),
  amenities: yup.array().of(yup.string()),
  name: yup.string(),
  firstName: yup.string(),
  lastName: yup.string(),
  email: yup.string().required("Required"),
  callingCode: yup.string(),
  countryCode: yup.string(),
  phoneNumber: yup.string().required("Required"),
  website: yup.string().url(),
  onMarket: yup.boolean().required(),
});