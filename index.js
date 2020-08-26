const express = require("express");
const app = express();
const axios = require("axios");

const BASEURL = "https://swapi.dev/api";
const PORT = 5000;

app.use(express.json());

//people endpoint
//sortBy option should be either height, mass or name
app.get("/people/:sortBy/:page", async (req, res) => {
  //fetch data
  const { sortBy, page } = req.params;
  console.log(req.params);
  const response = await axios.get(`${BASEURL}/people/?page=${page}`);
  //get name
  const { results } = response.data;
  //get sortBy params and run through switch of sorting
  const getFinalResults = () => {
    switch (sortBy) {
      case "height":
        return results.sort((a, b) => {
          return a.height - b.height;
        });
      case "name":
        return results.sort((a, b) => {
          if (a.name < b.name) {
            return -1;
          }
          if (a.name > b.name) {
            return 1;
          }
          return 0;
        });
      case "mass":
        return results.sort((a, b) => {
          return a.mass - b.mass;
        });
      default:
        break;
    }
  };
  res.send(getFinalResults());
});

// app.get("/planets", async (req, res) => {
//   const response = await axios.get(`${BASEURL}/planets`);
//   const plantes = await Promise.all(
//     response.data.results.map(async (planet) => {
//       return new Promise(async (res, rej) => {
//         let residents = await planet.residents.map(async (resident) => {
//           let person;
//           try {
//             person = await axios.get(resident);
//           } catch (e) {
//             console.log("resident failed: ", resident);
//             console.error(e);
//           }

//           console.log("name", person.data.name);
//           return person.data.name;
//         });
//         res({
//           ...planet,
//           residents,
//         });
//       }).then((v) => {
//         console.log("new planet", v);
//         return v;
//       });
//     })
//   ).then((all) => {
//     all.forEach(console.log);
//     return all;
//   });
//   response.data.results.forEach((planet) => {
//     planet.residents.forEach(async (resident, index) => {
//       const person = await axios.get(resident);
//       resident = person.data.name;
//       console.log(resident);
//     });
//   });
//   const [person] = response.data.results[0].residents;
//   console.log(person);
//   const name = await axios.get(person);
//   console.log("foo");
//   res.send(plantes);
// });

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

// app.get("/planets", async (req, res) => {
//   const response = await axios.get(`${BASEURL}/planets`);
//   console.log(response.data.results);
//   res.send(
//     response.data.results.map((planet) => {
//       planet.residents.map(async (resident) => {
//         const res = await axios.get(resident);
//         return res.data.name;
//       });
//       return { ...planet, residents };
//     })
//   );
// });

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
