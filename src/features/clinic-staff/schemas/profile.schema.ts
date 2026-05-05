import * as yup from 'yup';

export const clinicStaffProfileSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Validation.Required')
    .max(200, 'Validation.MaxLength.FullName'),
  phone: yup
    .string()
    .optional()
    .default('')
    .max(20, 'Validation.MaxLength.Phone'),
  dateOfBirth: yup.string().optional().default(''),
  gender: yup
    .string()
    .optional()
    .default('')
    .oneOf(
      ['male', 'female', 'other', 'prefernottotsay', ''],
      'Validation.Invalid.Gender'
    ),
  address: yup
    .string()
    .optional()
    .default('')
    .max(500, 'Validation.MaxLength.Address'),
  citizenId: yup
    .string()
    .optional()
    .default('')
    .test(
      'is-12-digits',
      'Validation.Invalid.CitizenId',
      (val) => !val || /^[0-9]{12}$/.test(val)
    ),
  department: yup
    .string()
    .optional()
    .default('')
    .max(100, 'Validation.MaxLength.Department'),
  employeeCode: yup
    .string()
    .optional()
    .default('')
    .max(50, 'Validation.MaxLength.EmployeeCode'),
});

export type ClinicStaffProfileFormData = yup.InferType<
  typeof clinicStaffProfileSchema
>;
