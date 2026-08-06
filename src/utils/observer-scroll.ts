export const observerScroll = (
  target: HTMLElement,
  callback: () => void,
  offset = 300,
  direction: "UP" | "DOWN" = "DOWN"
) => {
  const handle = (event: Event) => {
    const element = event.target! as HTMLElement;

    const distance = direction === "UP" ?
      element.scrollTop :
      element.scrollHeight - element.scrollTop - element.clientHeight;

    if (distance < offset) {
      callback();
    }
  };

  target.addEventListener("scroll", handle);

  return {
    disconnect: () => {
      target.removeEventListener("scroll", handle);
    }
  };
};