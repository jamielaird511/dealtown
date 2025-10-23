export function getSessionId() {
  const k = "dt_sid";
  let v = localStorage.getItem(k);
  if (!v) { 
    v = crypto.randomUUID(); 
    localStorage.setItem(k, v); 
  }
  return v;
}
