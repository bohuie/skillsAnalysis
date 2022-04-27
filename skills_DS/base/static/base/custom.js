const onScroll = () => {
  let element = document.getElementById("consentForm")
  if (element.offsetHeight + element.scrollTop >= element.scrollHeight) {
    document.getElementById("consentCheck").disabled = false
  }
}

const enableRegister = () => {
  document.getElementById("register").disabled = !document.getElementById("consentCheck").checked
}
