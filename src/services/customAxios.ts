import axios from "axios"; 
import apiUrl from "../config";

const axiosinstance = axios.create({
  baseURL : apiUrl,
});

export default axiosinstance;