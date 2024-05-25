import axios from "axios";

class Http {
  instance;
  constructor() {
    this.instance = axios.create({
      baseURL: "http://10.0.2.2:8000/api/v1",
      // baseURL: "http://localhost:8000/api/v1",
      timeout: 10000, // 10 seconds
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.instance.interceptors.response.use((response) => {
      return response.data;
    });
  }
}

const httpRequest = new Http().instance;

export default httpRequest;
