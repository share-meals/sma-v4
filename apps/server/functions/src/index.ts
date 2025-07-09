import {initializeApp} from "firebase-admin/app";
import {post} from './post';
import {share} from './share';
import {pantryLink} from "./pantryLink";
import {user} from "./user";

initializeApp();

const endpoints = {
  post,
  share,
  pantry: {
    link: pantryLink
  },
  user,
};

module.exports = endpoints;
