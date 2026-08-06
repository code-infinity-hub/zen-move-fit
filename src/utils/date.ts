const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export const date = () => {
  const validate = (str: string, type: "past" | "future") => {
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    const match = str.match(regex);

    if (!match) return false;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    // limites básicos
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;

    const date = new Date(year, month - 1, day);

    // JS corrige datas inválidas (ex: 31/02 vira 03/03)
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return false;
    }

    const today = new Date();

    if (type === "past") {
      if (date > today) return false;
    } else {
      if (date <= today) return false;
    }

    return true;
  };

  const toBr = (str: string) => {
    if (/^(\d{2})\/(\d{2})\/(\d{4})$/.test(str)) {
      return str;
    }

    return str.replace(/^(\d{4})-(\d{2})-(\d{2})$/, "$3/$2/$1");
  };

  const toUs = (str: string) => {
    if (/^(\d{4})-(\d{2})-(\d{2})$/.test(str)) {
      return str;
    }

    return str.replace(/^(\d{2})\/(\d{2})\/(\d{4})$/, "$3-$2-$1");
  };

  const fromSecondsToMinutes = (seconds: number) => Math.floor(seconds / 60);

  const formatTime = (seconds: number, showHours = false) => {
    const s = Math.floor(seconds % 60);
    const m = Math.floor((seconds / 60) % 60);
    const h = Math.floor(seconds / 3600);

    const pad = (n: number) => String(n).padStart(2, "0");

    return h > 0 || showHours ?
      `${pad(h)}:${pad(m)}:${pad(s)}` :
      `${pad(m)}:${pad(s)}`;
  };

  const formatDateTimeLong = (date: string) => {
    const locale = navigator.language.split("-")[0];

    return capitalize(
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(date))
    );
  };

  return { formatDateTimeLong, toBr, toUs, validate, fromSecondsToMinutes, formatTime };
};