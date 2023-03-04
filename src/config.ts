let apiUrl : string | undefined;

if (process.env.NODE_ENV === "production") {
    apiUrl="https://coral-betta-hose.cyclic.app"
} else {
    apiUrl=""
}

export default apiUrl