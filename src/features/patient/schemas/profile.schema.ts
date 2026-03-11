import * as yup from 'yup';

export const profileSchema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .max(200, 'Full name must not exceed 200 characters'),
  phone: yup
    .string()
    .optional()
    .default('')
    .max(20, 'Phone number must not exceed 20 characters'),
  dateOfBirth: yup.string().optional().default(''),
  gender: yup
    .string()
    .optional()
    .default('')
    .oneOf(['male', 'female', 'other', ''], 'Invalid gender'),
  address: yup
    .string()
    .optional()
    .default('')
    .max(500, 'Address must not exceed 500 characters'),
});

export type ProfileFormData = yup.InferType<typeof profileSchema>;

export const changePasswordSchema = yup.object().shape({
  currentPassword: yup.string().required('Current password is required'),
  newPassword: yup
    .string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .notOneOf(
      [yup.ref('currentPassword')],
      'New password must be different from current password'
    ),
  confirmNewPassword: yup
    .string()
    .required('Password confirmation is required')
    .oneOf([yup.ref('newPassword')], 'Passwords do not match'),
});

export type ChangePasswordFormData = yup.InferType<typeof changePasswordSchema>;
