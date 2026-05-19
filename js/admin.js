function isAdmin() {
    let user = JSON.parse(localStorage.getItem('currentUser'))
    return user && user.role === 'admin';
}

if (isAdmin() === true){

}
else {
    document.location.href = "/";
}