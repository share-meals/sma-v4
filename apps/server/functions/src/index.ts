import {initializeApp} from "firebase-admin/app";
import {post} from './post';
import {smartPantry} from "./smartPantry";
import {user} from "./user";

initializeApp();

// community: require('./community'),
const endpoints = {
  post,
  smart: {
    pantry: smartPantry
  },
  user,
};

module.exports = endpoints;
