const apiCall = async (method, path, requestBody = null, token = null, authed = false, queryParams = null) => {
    const config = {
      method,
      headers: {
        'Content-type': 'application/json',
        Authorization: authed ? `Bearer ${token}` : undefined,
      }
    }
    
    if (method === 'GET' || method === 'DELETE') {
      config.body = undefined;
    } else {
      config.body = JSON.stringify(requestBody);
    }

    let url = `http://localhost:8080/${path}`
    if (queryParams) {
      const params = new URLSearchParams(queryParams);
      url += `?${params.toString()}`;
    }

    const response = await fetch(url, config);
    const data = await response.json();
    return data;
  }
  
  const fileToDataUrl = async (file) => {
    const validFileTypes = ['image/jpeg', 'image/png', 'image/jpg']
    const valid = validFileTypes.find(type => type === file.type);
    // Bad data, let's walk away.
    if (!valid) {
      throw Error('provided file is not a png, jpg or jpeg image.');
    }
  
    const reader = new FileReader();
    reader.readAsDataURL(file);
    const dataUrlPromise = await new Promise((resolve, reject) => {
      reader.onerror = reject;
      reader.onload = () => resolve(reader.result);
    });
    return dataUrlPromise;
  }
  

export default apiCall;
export { apiCall, fileToDataUrl };
