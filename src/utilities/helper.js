const fs = require("fs");
const randomStringGenerator = (length = 100) => {
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const len = chars.length;
  let random = "";

  for (let i = 0; i < length; i++) {
    const posn = Math.ceil(Math.random() * len);
    random += chars[posn];
  }
  return random;
};
const randomNumberGenerator = (len) => {
    const chars = "0123456789";
    let randomString = "";
    for (let i = 0; i < len; i++) {
        const pos = Math.floor(Math.random() * chars.length);
        randomString += chars[pos];
    }
    return randomString;
};

const deleteFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};
const getDateRange = (query) => {
    const { startDate, endDate } = query;
    let start = startDate ? new Date(startDate) : new Date(new Date().setDate(new Date().getDate() - 30));
    let end = endDate ? new Date(endDate) : new Date();

    start.setHours(0, 0, 0, 0);       

    return {
        createdAt: {
            $gte: start,
            $lte: end,
        },
    };
};

const generateSeat = (screen) =>  {
  let seats = [];

  if (screen === "SCREEN1") {
    const rows = ["A", "B", "C"];
    const cols = 40;
    rows.forEach((row) => {
      for (let i = 1; i <= cols; i++) {
        seats.push({
          seatNumber: `${row}${i.toString().padStart(2, "0")}`,
          isBooked: false,
        });
      }
    });

  } else if (screen === "SCREEN2") {
    const rows = ["A", "B", "C"];
    const cols = 40;
    rows.forEach((row) => {
      for (let i = 1; i <= cols; i++) {
        seats.push({
          seatNumber: `${row}${i.toString().padStart(2, "0")}`,
          isBooked: false,
        });
      }
    });

  } else if (screen === "SCREEN3") {
    const rows = ["A", "B", "C"];
    const cols = 40;
    rows.forEach((row) => {
      for (let i = 1; i <= cols; i++) {
        seats.push({
          seatNumber: `${row}${i.toString().padStart(2, "0")}`,
          isBooked: false,
        });
      }
    });
  }

  return seats;
}


module.exports = {
  randomStringGenerator,
  deleteFile,
  generateSeat,
  getDateRange,
  randomNumberGenerator
};
