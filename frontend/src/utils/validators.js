export const validators = {
  required: (value) => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return "This field is required";
    }
    return null;
  },

  email: (value) => {
    if (!value) return "Email is required";
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(value)) return "Invalid email address";
    return null;
  },

  minLength: (min) => (value) => {
    if (!value || value.length < min) {
      return `Must be at least ${min} characters`;
    }
    return null;
  },

  maxLength: (max) => (value) => {
    if (value && value.length > max) {
      return `Must not exceed ${max} characters`;
    }
    return null;
  },

  phone: (value) => {
    if (!value) return null; // optional
    const re = /^[+]?[\d\s\-()]{7,15}$/;
    if (!re.test(value)) return "Invalid phone number";
    return null;
  },

  positive: (value) => {
    if (value !== undefined && value !== null && value !== "" && Number(value) <= 0) {
      return "Must be a positive number";
    }
    return null;
  },

  dateRange: (start, end) => {
    if (start && end && new Date(start) > new Date(end)) {
      return "End date must be after start date";
    }
    return null;
  },

  rating: (value) => {
    const num = Number(value);
    if (num < 1 || num > 5) return "Rating must be between 1 and 5";
    return null;
  },
};

// Validate a form object against a schema
export const validateForm = (values, schema) => {
  const errors = {};
  Object.keys(schema).forEach(field => {
    const fieldValidators = schema[field];
    for (const validate of fieldValidators) {
      const error = validate(values[field], values);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  return errors;
};
