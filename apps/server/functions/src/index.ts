import {initializeApp} from "firebase-admin/app";
import {post} from './post';
import {share} from './share';
import {smartPantry} from "./smartPantry";
import {user} from "./user";

initializeApp();

const endpoints = {
  post,
  share,
  smart: {
    pantry: smartPantry
  },
  user,
};

module.exports = endpoints;
