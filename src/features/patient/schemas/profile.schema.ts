import * as yup from 'yup';

export const profileSchema = yup.object().shape({
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
    .oneOf(['male', 'female', 'other', ''], 'Validation.Invalid.Gender'),
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
});

export type ProfileFormData = yup.InferType<typeof profileSchema>;

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('Validation.Required'),
  newPassword: yup
    .string()
    .required('Validation.Required')
    .min(8, 'Validation.MinLength.Password')
    .notOneOf(
      [yup.ref('currentPassword')],
      'Validation.Password.MustBeDifferent'
    ),
  confirmNewPassword: yup
    .string()
    .required('Validation.Required')
    .oneOf([yup.ref('newPassword')], 'Validation.Password.Mismatch'),
});

export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;
