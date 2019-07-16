export const copyToClipboard = text => {
  const textArea = document.createElement("textArea");
  document.body.appendChild(textArea);
  textArea.value = text;
  textArea.select();
  document.execCommand("copy");
  textArea.remove();
};
