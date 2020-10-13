import { promises as fs } from 'fs';

let statesList = [];
let citiesList = [];
init()

getStatesWithMoreOrLessCities(true)
getStatesWithMoreOrLessCities(false)
getBiggerOrSmallerNameCities(true)
getBiggerOrSmallerNameCities(false)
getBiggerOrSmallerCityName(true)
getBiggerOrSmallerCityName(false)

async function init() {
  try {
    statesList = JSON.parse(await fs.readFile('./files/estados.json'));
    citiesList = JSON.parse(await fs.readFile('./files/cidades.json'));

    for (let i = 0; i < statesList.length; i++) {
      let current = citiesList.filter((city) => city.Estado === statesList[i].ID);
      await fs.writeFile(`./output/${statesList[i].Sigla}.json`, JSON.stringify(current));
    }
  } catch (err) {
    console.log(err);
  }
}

async function getCitiesCount(uf) {
  const data = await fs.readFile(`./output/${uf}.json`);
  const cities = JSON.parse(data);
  return cities.length;
}

async function getStatesWithMoreOrLessCities(more) {
  const states = JSON.parse(await fs.readFile('./files/estados.json'));
  const list = [];

  for (statesList of states) {
    const count = await getCitiesCount(statesList.Sigla);
    list.push({ uf: statesList.Sigla, count });
  }

  list.sort((a, b) => {
    if (a.count < b.count) return 1;
    else if (a.count > b.count) return -1;
    else return 0;
  });

  const result = [];
  if (more) {
    list
      .slice(0, 5)
      .forEach((item) => result.push(item.uf + ' - ' + item.count));
  } else {
    list.slice(-5).forEach((item) => result.push(item.uf + ' - ' + item.count));
  }

  console.log(result);
}

async function getBiggerOrSmallerNameCities(bigger) {
  const states = JSON.parse(await fs.readFile('./files/estados.json'));
  const result = [];

  for (statesList of states) {
    if (bigger) {
      citiesList = await getBiggerName(statesList.Sigla);
    } else {
      citiesList = await getSmallerName(statesList.Sigla);
    }

    result.push(citiesList.Nome + ' - ' + statesList.Sigla);
  }
  console.log(result);
}

async function getBiggerName(uf) {
  const cities = JSON.parse(await fs.readFile(`./output/${uf}.json`));

  let result;

  cities.forEach((city) => {
    if (!result) result = city;
    else if (city.Nome.length > result.Nome.length) result = city;
    else if (
      city.Nome.length === result.Nome.length &&
      city.Nome.toLowerCase() < result.Nome.toLowerCase()
    )
      result = city;
  });

  return result;
}

async function getSmallerName(uf) {
  const cities = JSON.parse(await fs.readFile(`./output/${uf}.json`));

  let result;

  cities.forEach((city) => {
    if (!result) result = city;
    else if (city.Nome.length < result.Nome.length) result = city;
    else if (
      city.Nome.length === result.Nome.length &&
      city.Nome.toLowerCase() < result.Nome.toLowerCase()
    )
      result = city;
  });

  return result;
}

async function getBiggerOrSmallerCityName(bigger) {
  const states = JSON.parse(await fs.readFile('./files/estados.json'));
  const list = [];
  for (statesList of states) {
    let city;
    if (bigger) {
      city = await getBiggerName(statesList.Sigla);
    } else {
      city = await getSmallerName(statesList.Sigla);
    }
    list.push({ name: city.Nome, uf: statesList.Sigla });
  }
  const result = list.reduce((prev, current) => {
    if (bigger) {
      if (prev.name.length > current.name.length) return prev;
      else if (prev.name.length < current.name.length) return current;
      else
        return prev.name.toLowerCase() < current.name.toLowerCase()
          ? prev
          : current;
    } else {
      if (prev.name.length < current.name.length) return prev;
      else if (prev.name.length > current.name.length) return current;
      else
        return prev.name.toLowerCase() < current.name.toLowerCase()
          ? prev
          : current;
    }
  });
  console.log(result.name + ' - ' + result.uf);
}

