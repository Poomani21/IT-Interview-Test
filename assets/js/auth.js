function handleCredentialResponse(response) {

    const data = parseJwt(response.credential);
    
    localStorage.setItem("user", JSON.stringify(data));
    
    window.location.href = "dashboard.html";
    
    }
    
    function parseJwt (token) {
    
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    return JSON.parse(window.atob(base64));
    
    }