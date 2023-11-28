const fs = require("fs").promises;
const filePath = "./database.csv";
const crypto = require("crypto");

const readParseCSV = async () => {
  try {
    const data = await fs.readFile(filePath, "utf-8");
    const lines = data.trim().split("\n");

    const headers = lines[0].split(",").map((header) => header.trim());
    const result = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      const entry = {};

      headers.forEach((header, index) => {
        entry[header] = values[index].trim();
      });

      result.push(entry);
      
    }
    

    return result;
  } catch (error) {
    console.error("Error reading or parsing CSV:", error);
    throw error;
  }
};

const hashPassword = (password) => {
  const hash = crypto.createHash("sha256");
  hash.update(password);
  return hash.digest("hex");
};

const passwordOutputFile = () => {
  const resultPromise = readParseCSV();

  return resultPromise.then(result => {
    // Hashed passwords for all fields
    const hashedPass = result.map(entry => {
      const hashedEntry = { ...entry };
      if (hashedEntry.password && hashedEntry.password !== '-') {
        hashedEntry.password = hashPassword(hashedEntry.password);
      }
      return hashedEntry;
    });

    const outputFile = "./hash_database.csv";

    // Extract headers and format
    const headers = Object.keys(result[0]);
    const headerLine = headers.join(", ");

    // Extract data and format
    const csvData = hashedPass.map(entry => Object.values(entry).join(", "));

    // Join headers line with csv data cells
    const fileContent = `${headerLine}\n${csvData.join("\n")}`;

    return fs.writeFile(outputFile, fileContent).then(() => hashedPass);
  }).then(hashedPass => {
    console.log(`Data has been written to hash_database.csv`);
    return hashedPass;
  });
};

const filteredDatabase = () => {
  const resultPromise = passwordOutputFile();

  return resultPromise.then(result => {

    const filteredResult = result
      .filter(entry => entry.id !== '-' && entry['consent to mailing'] !== '-' && entry.nickname !== '-')
      .map((entry, index) => {
        entry.id = index + 1
        entry['consent to mailing'] = entry['consent to mailing'].replace('-', '')
        return entry
      })
    // const filteredResult = [];
    // let idCounter = 1;

    // result.forEach((entry) => {
    //   if (entry.id !== '-' && entry.nickname !== '-') {
    //     entry.id = idCounter++; // reorder row indexes
    //     entry['consent to mailing'] = entry['consent to mailing'].replace('-', '');
    //     filteredResult.push(entry);
    //   }
    // });

    const outputFile = './filtered_database.csv';

    const headers = ['id', 'nickname', 'password', 'consent to mailing'];
    const headersLine = headers.join(", ");

    const csvData = filteredResult.map(entry => Object.values(entry).join(", "));

    const fileContent = `${headersLine}\n${csvData.join("\n")}`;

    return fs.writeFile(outputFile, fileContent).then(() => {
      console.log('Data has been written to filtered_database.csv');
    });
  });
};

// Call the functions
passwordOutputFile().then(filteredDatabase);



