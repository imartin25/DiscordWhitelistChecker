import { config } from "dotenv"
import { Client, GatewayIntentBits, Routes } from "discord.js"
import { REST } from '@discordjs/rest'
import * as fs from 'fs';
config()
const BOT_TOKEN = process.env.BOT_TOKEN
const CLIENT_ID = process.env.CLIENT_ID
const GUILD_ID = process.env.GUILD_ID

const client = new Client({
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages
    ]
})
client.login(BOT_TOKEN)

client.on("messageCreate", (msg) => { console.log(msg.content) })

let wallets = []
fs.readFile('./src/wallets.json', async function read(error, data) {
    if (error) {
        throw (error)
    }
    wallets = await JSON.parse(data)[0]
})

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN)

client.on("interactionCreate", async (interaction) => {
    if (interaction.isChatInputCommand()) {
        console.log("Hey world, interaction is chat imput command!")
        if (interaction.commandName == "wl") {
            let userWallet = interaction.options.getString("wallet")
            const regex = /^0x[a-fA-F0-9]{40}$/g
            userWallet = userWallet.replace(/\s/g, '');
            console.log(userWallet)
            if (!regex.test(userWallet)) {
                interaction.reply({ content: "Please provide a valid ERC20 address." })
            } else {
                let flag = 0
                console.log("Looking for wallet in db")
                for (let i = 0; i < Object.keys(wallets).length; i++) {
                    if (userWallet == wallets[i]) {
                        flag = 1
                        interaction.reply({ content: "You are part of the whitelist." })
                        return;
                    }
                }
                if (flag == 0) {
                    interaction.reply({ content: "You are NOT part of the whitelist." })
                }
            }
        }
    }
})

async function main() {
    const commands = [
        {
            name: 'wl',
            description: 'Check if you are part of the whitelist',
            options: [
                {
                    name: "wallet",
                    description: "Submit your wallet address",
                    type: 3,
                    required: true,
                },
            ],
        },
    ]
    try {
        console.log("Started refreshing application (/) commands.")
        await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: commands });
    } catch (err) {
        console.log(err)
    }
}
main()