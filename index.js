const express = require("express");
const app = express();
const axios = require("axios");

const BASEURL = "https://swapi.dev/api";
const PORT = 5000;

app.use(express.json());

app.get("/people/:sortBy", async (req, res) => {
  let allPeople = [];
  const { sortBy } = req.params;
  console.log(req.params);

  const getViaDoWhile = async (url) => {
    let response;
    do {
      response = await axios.get(url);
      allPeople.push(...response.data.results);
      url = response.data.next;
    } while (response.data.next);
  };

  // const getViaRecursion = async (url) => {
  //   let response;
  //   response = await axios.get(url);
  //   allPeople = allPeople.push(...response.data.results);
  //   if (!response.data.next) {
  //     return;
  //   }
  //   getViaRecursion(response.data.next);
  // };

  // const getViaBruteForce = async (url) => {
  //   let response;
  //   for (let i = 1; i < 9; i++) {
  //     response = await axios.get(`${url}/people/?page=${i}`);
  //     allPeople = allPeople.concat(response.data.results);
  //   }
  // };

  const getFinalResults = (arr, type) => {
    switch (type) {
      case "height":
        return arr.sort((a, b) => {
          if (isNaN(a.height)) {
            return 1;
          } else if (isNaN(b.height)) {
            return -1;
          }
          return a.height - b.height;
        });
      case "name":
        return arr.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      case "mass":
        return arr.sort((a, b) => {
          if (isNaN(a.mass)) {
            return 1;
          } else if (isNaN(b.mass)) {
            return -1;
          }
          return a.mass - b.mass;
        });
      default:
        break;
    }
  };

  const getAndSort = async () => {
    await getViaDoWhile(`${BASEURL}/people`);
    const allPeopleNoCommas = allPeople.map((person) => {
      person.mass = person.mass.replace(",", "");
      return person;
    });
    const sortedList = getFinalResults(allPeopleNoCommas, sortBy);
    res.send(sortedList);
  };
  getAndSort();
});

app.get("/planets", async (_, res) => {
  const response = await axios.get(`${BASEURL}/planets`);
  res.send(
    await Promise.all(
      response.data.results.map((planet) =>
        Promise.all(
          planet.residents.map((resident) =>
            axios.get(resident).then((res) => res.data.name)
          )
        ).then((residents) => ({ ...planet, residents }))
      )
    )
  );
});

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
