export function getErrorMessage(err) {
  const msg =
    err?.response?.data?.message ||
    (Array.isArray(err?.response?.data?.errors) ? err.response.data.errors[0]?.msg : null) ||
    err?.message ||
    "Something went wrong";
  return String(msg);
}

