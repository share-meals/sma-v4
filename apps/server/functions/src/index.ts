import {initializeApp} from "firebase-admin/app";
import {post} from './post';
import {smartpantry} from "./smartpantry";
import {user} from "./user";

initializeApp();

// community: require('./community'),
const endpoints = {
  post,
  smartpantry,
  user,
};

module.exports = endpoints;
