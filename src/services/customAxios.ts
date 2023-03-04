import axios from "axios"; 

const axiosinstance = axios.create({
  baseURL : process.env.api,
});

export default axiosinstance;