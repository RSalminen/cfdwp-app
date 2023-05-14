let apiUrl : string | undefined;

if (process.env.NODE_ENV === "production") {
    apiUrl="https://cfdwp-server.onrender.com"
} else {
    apiUrl=""
}

export default apiUrl