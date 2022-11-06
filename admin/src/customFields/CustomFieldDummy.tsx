
import React from "react";
import { Alert, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { FieldProps } from "@camberi/firecms";
import { getFunctions, httpsCallable } from 'firebase/functions';
import { SelectChangeEvent } from '@mui/material/Select';

const fieldText = 'By clicking inside this field, you can create individual donation certificates!';

interface CustomColorTextFieldProps {
    color: string
}

export default function CustomColorTextField({
                                                 property,
                                                 value,
                                                 setValue,
                                                 customProps,
                                                 touched,
                                                 error,
                                                 isSubmitting,
                                                 context, // the rest of the entity values here
                                                 ...props
                                             }: FieldProps<string, CustomColorTextFieldProps>) {
                                                
    
    const years = ['2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2023'];
    const countries = ['Switzerland'];
    const yearMenuItems = years.map(item => (
        <MenuItem key={item} value={item}>{item}</MenuItem>
    ));
    const countryMenuItems = countries.map(item => (
        <MenuItem key={item} value={item}>{item}</MenuItem>
    ))
    const [year, setYear] = React.useState(years[0]);
    const [country, setCountry] = React.useState(countries[0]);

    const [successMessageFlag, setSuccessMessageFlag] = React.useState(false);
    const [errorMessageFlag, setErrorMessageFlag] = React.useState(false);

    const changeYear = (event: SelectChangeEvent) => {
        setYear(event.target.value as string)
      };

    const changeCountry = (event: SelectChangeEvent) => {
        setCountry(event.target.value as string)
      };


    const onGenerateDonationCertificate = () => {

        console.log(context);
        value = fieldText;
        const functions = getFunctions();
        console.log(functions);
        const donationCertificateBuilderFunction = httpsCallable(functions, 'donationCertificateBuilderFunction');

        const request = {
            'year': year,
            'country' : country,
            'context': context,
            'address' : context.values.address,
            'personal': context.values.personal
        }

        setSuccessMessageFlag(false);
        setErrorMessageFlag(false);

        donationCertificateBuilderFunction(request)
            .then((res) => {
                console.log(res);
                setSuccessMessageFlag(true);
            })
            .catch((err) => {
                console.log(err);
                setErrorMessageFlag(true);
            });
        setValue(
            fieldText
        )
    };

    return (
        <>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Year</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={year}
                    label="Year"
                    onChange={changeYear}
                >
                    {yearMenuItems}
                </Select>
                </FormControl><br></br>
            <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Country</InputLabel>
                <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={country}
                    label="Country"
                    onChange={changeCountry}
                >
                    {countryMenuItems}
                </Select>
            </FormControl><br></br>
            <Button variant="contained"
                onClick={(evt: any) => {
                    onGenerateDonationCertificate();
                }}
            >Generate new Donation Certificate!
            </Button>
            <br></br>
            { successMessageFlag ? <Alert severity="success">Donation Certificate successfully generated.</Alert> : null }
            { errorMessageFlag ? <Alert severity="error">Donation Certification Genearion failed.</Alert> : null }
        </>

    );

}

/*
Adding the custom field to the collection:
		donation_certificates_generator: {
			name: "Donation Certificate Generator",
			description: "Here you can generate all donation certificates",
			dataType: "string",
			markdown: true,
			defaultValue: 'By clicking inside this field, you can create individual donation certificates!',
			Field: CustomColorTextField,
		},
*/
