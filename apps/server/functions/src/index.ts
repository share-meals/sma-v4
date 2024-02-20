import {initializeApp} from "firebase-admin/app";
import {smartpantry} from "./smartpantry";
import {user} from "./user";

initializeApp();

// community: require('./community'),
const endpoints = {
  smartpantry,
  user,
};

module.exports = endpoints;
