const mongoose = require('mongoose');
const mongoUtils = require('../utils/mongoUtils');

module.exports = {
    schema: {
        editor: {
            type: Number,
            ref: "user",
            required: true
        },
        poi: {
            type: Number,
            ref: "poi"
        },
        audio: {
            type: String,
            required: true,
        },
        purpose: {
            type: String,
            required: true,
        },
        language: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            required: true,
        },
        audience: {
            type: String,
            required: true,
        },
        detail: {
            type: Number,
            required: true,
        }
    },
    init: [
        {
            "_id": 0,
            "editor": 0,
            "poi": 0,
            "audio": "https://www.youtube.com/watch?v=Ie74qykp_n0",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 1,
            "editor": 0,
            "poi": 0,
            "audio": "https://www.youtube.com/watch?v=jftwo_ARPLI",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 2,
            "editor": 0,
            "poi": 1,
            "audio": "https://www.youtube.com/watch?v=Gbm1_bpxaXY",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 3,
            "editor": 0,
            "poi": 1,
            "audio": "https://www.youtube.com/watch?v=5Frp6L9Zm6I",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 4,
            "editor": 0,
            "poi": 2,
            "audio": "https://www.youtube.com/watch?v=ChR28qJq12M",
            "purpose": "how",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 5,
            "editor": 0,
            "poi": 2,
            "audio": "https://www.youtube.com/watch?v=dyEuII4I_DM",
            "purpose": "what",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 6,
            "editor": 0,
            "poi": 3,
            "audio": "https://www.youtube.com/watch?v=hss-qtXwszI",
            "purpose": "how",
            "language": "ita",
            "content": "spo",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 7,
            "editor": 0,
            "poi": 3,
            "audio": "https://www.youtube.com/watch?v=sIh08OPzaNA",
            "purpose": "what",
            "language": "ita",
            "content": "spo",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 8,
            "editor": 0,
            "poi": 4,
            "audio": "https://www.youtube.com/watch?v=uZFILNIETQU",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 9,
            "editor": 0,
            "poi": 4,
            "audio": "https://www.youtube.com/watch?v=xbLau_2nQCk",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 10,
            "editor": 0,
            "poi": 5,
            "audio": "https://www.youtube.com/watch?v=2C56Tr52P7E",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 11,
            "editor": 0,
            "poi": 5,
            "audio": "https://www.youtube.com/watch?v=y7_icL6z60o",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 12,
            "editor": 0,
            "poi": 6,
            "audio": "https://www.youtube.com/watch?v=cEgcaU9xR90",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 13,
            "editor": 0,
            "poi": 6,
            "audio": "https://www.youtube.com/watch?v=JqZNrnBcjeU",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 14,
            "editor": 0,
            "poi": 7,
            "audio": "https://www.youtube.com/watch?v=0x5uxF1z1jE",
            "purpose": "how",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 15,
            "editor": 0,
            "poi": 7,
            "audio": "https://www.youtube.com/watch?v=ezYqJxYdS34",
            "purpose": "what",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 16,
            "editor": 0,
            "poi": 8,
            "audio": "https://www.youtube.com/watch?v=ACMUtboVqk4",
            "purpose": "how",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 17,
            "editor": 0,
            "poi": 8,
            "audio": "https://www.youtube.com/watch?v=QWIPE5sq61A",
            "purpose": "what",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 18,
            "editor": 0,
            "poi": 9,
            "audio": "https://www.youtube.com/watch?v=mdrzCUDu8lg",
            "purpose": "how",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 19,
            "editor": 0,
            "poi": 9,
            "audio": "https://www.youtube.com/watch?v=2O4Pcb5RHlA",
            "purpose": "what",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 20,
            "editor": 0,
            "poi": 10,
            "audio": "https://www.youtube.com/watch?v=UV4l0YwG8Kc",
            "purpose": "how",
            "language": "eng",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 21,
            "editor": 0,
            "poi": 10,
            "audio": "https://www.youtube.com/watch?v=skEFfalHfzQ",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 22,
            "editor": 0,
            "poi": 11,
            "audio": "https://www.youtube.com/watch?v=-cAccOL7Me0",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 23,
            "editor": 0,
            "poi": 11,
            "audio": "https://www.youtube.com/watch?v=3E389wsOc14",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 24,
            "editor": 0,
            "poi": 12,
            "audio": "https://www.youtube.com/watch?v=FnK4VfZRNBk",
            "purpose": "how",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 25,
            "editor": 0,
            "poi": 12,
            "audio": "https://www.youtube.com/watch?v=ReFqwmDv1Kg",
            "purpose": "what",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 26,
            "editor": 0,
            "poi": 13,
            "audio": "https://www.youtube.com/watch?v=UfMRs9NnL84",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 27,
            "editor": 0,
            "poi": 13,
            "audio": "https://www.youtube.com/watch?v=rXC9SefBQcc",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 28,
            "editor": 0,
            "poi": 14,
            "audio": "https://www.youtube.com/watch?v=hFd7HE5z4y8",
            "purpose": "how",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 29,
            "editor": 0,
            "poi": 14,
            "audio": "https://www.youtube.com/watch?v=meQ7YFu6KGM",
            "purpose": "what",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 30,
            "editor": 0,
            "poi": 15,
            "audio": "https://www.youtube.com/watch?v=GSLpM7BvPfo",
            "purpose": "how",
            "language": "eng",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 31,
            "editor": 0,
            "poi": 15,
            "audio": "https://www.youtube.com/watch?v=MI51juBc5Y0",
            "purpose": "what",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 32,
            "editor": 0,
            "poi": 16,
            "audio": "https://www.youtube.com/watch?v=KJgPRYO_Bic",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 33,
            "editor": 0,
            "poi": 16,
            "audio": "https://www.youtube.com/watch?v=MZj8Rg-VOmQ",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 34,
            "editor": 0,
            "poi": 17,
            "audio": "https://www.youtube.com/watch?v=vBMDcNcoAVo",
            "purpose": "how",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 35,
            "editor": 0,
            "poi": 17,
            "audio": "https://www.youtube.com/watch?v=P_14D4COQ3Y",
            "purpose": "what",
            "language": "ita",
            "content": "his",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 36,
            "editor": 0,
            "poi": 18,
            "audio": "https://www.youtube.com/watch?v=ldQKcxC3bnQ",
            "purpose": "how",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 37,
            "editor": 0,
            "poi": 18,
            "audio": "https://www.youtube.com/watch?v=IFIxnRSZ18c",
            "purpose": "what",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        },
        {
            "_id": 38,
            "editor": 0,
            "poi": 19,
            "audio": "https://www.youtube.com/watch?v=Ni--m4Tj_Lw",
            "purpose": "how",
            "language": "ita",
            "content": "rel",
            "audience": "gen",
            "detail": 1
        },
        {
            "_id": 39,
            "editor": 0,
            "poi": 19,
            "audio": "https://www.youtube.com/watch?v=6JRUedolhiI",
            "purpose": "what",
            "language": "eng",
            "content": "rel",
            "audience": "gen",
            "detail": 2
        }
    ]
};