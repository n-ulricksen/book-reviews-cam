export default function shortenText(text) {
  if (text.length <= 20) {
    return text;
  } else {
    return text.slice(0, 18) + "...";
  }
}
