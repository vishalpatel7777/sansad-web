export function formatEmail(email) {
  if (!email || email === "NA") return "Not Available";

  return email.replace(/\[at\]/gi, "@").replace(/\[dot\]/gi, ".");
}

export function formatPhone(phone) {
  if (!phone || phone === "NA") return "Not Available";

  return phone
    .replace(/[{}]/g, "") // remove { }
    .replace(/\(O\)/gi, " (Office)")
    .replace(/\(R\)/gi, " (Residence)");
}


export function formatDateDMY(dateStr) {
  if (!dateStr) return "Not Available";

  // Expected input: YYYY-MM-DD
  const parts = dateStr.split("-");
  if (parts.length !== 3) return dateStr;

  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
}
