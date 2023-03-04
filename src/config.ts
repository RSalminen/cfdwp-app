let apiUrl : string | undefined;

if (process.env.NODE_ENV === "production") {
    apiUrl="https://api-cfdwp.onrender.com"
} else {
    apiUrl=""
}

export default apiUrl