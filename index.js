const {
    Client,
    GatewayIntentBits,
    Events,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    PermissionsBitField,
    StringSelectMenuBuilder
} = require("discord.js");

const fs = require("fs");
require("dotenv").config();

// =========================
// 🤖 BOT
// =========================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// =========================
// 💾 DATA
// =========================

let data = {
    sanktionen: 0,
    wochen: 0,
    spenden: 0,
    total: 0
};

function save() {
    fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

// =========================
// 💣 § KATALOG
// =========================

const sanktionen = [
{ name: "§1 Nichterscheinen", cost: 75000 },
{ name: "§2 Funkdisziplin", cost: 200000 },
{ name: "§3 Gewalt", cost: 100000 },
{ name: "§19 Anwesen", cost: 100000 }
];

// =========================
// 🏦 FINANZ UPDATE
// =========================

async function updateFinance(guild) {

    const ch = guild.channels.cache.find(c => c.name === "🏦┃Finanz-übersicht");
    if (!ch) return;

    const embed = new EmbedBuilder()
        .setTitle("🏦 Finanz Übersicht")
        .setColor(0x00ccff)
        .addFields(
            { name: "💰 Gesamtkasse", value: `${data.total}$` },
            { name: "🚫 Sanktionen", value: `${data.sanktionen}$` },
            { name: "💷 Wochenabgaben", value: `${data.wochen}$` },
            { name: "🎁 Spenden", value: `${data.spenden}$` }
        );

    await ch.send({ embeds: [embed] }).catch(() => {});
}

// =========================
// 🚀 READY
// =========================

client.once(Events.ClientReady, () => {
    console.log(`✅ Online als ${client.user.tag}`);
});

// =========================
// 📌 PANELS
// =========================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    // =========================
    // !panel
    // =========================

    if (message.content === "!panel") {

        const ch = message.guild.channels.cache.find(c => c.name === "🏦┃Finanz-übersicht");

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("sanktion")
                .setPlaceholder("💣 Sanktion wählen")
                .addOptions(
                    sanktionen.map((s, i) => ({
                        label: s.name,
                        value: String(i),
                        description: `${s.cost}$`
                    }))
                )
        );

        const btn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("bezahlt")
                .setLabel("✅ Bezahlt")
                .setStyle(ButtonStyle.Success)
        );

        ch.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("💣 Sanktionen Panel")
                    .setColor(0xff0000)
            ],
            components: [menu, btn]
        });

        message.reply("✅ Panel erstellt");
    }

    // =========================
    // 🧾 ABMELDUNG PANEL
    // =========================

    if (message.content === "!abmeldung") {

        const ch = message.guild.channels.cache.find(c => c.name === "🚑┃Abmelden");

        ch.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚑 Abmeldung System")
                    .setDescription("Klicke um dich abzumelden")
            ]
        });
    }

    // =========================
    // 💷 WOCHEN + SPENDEN PANEL
    // =========================

    if (message.content === "!wochen") {

        const ch = message.guild.channels.cache.find(c => c.name === "💷┃Wochenabgabe-verwaltung");

        ch.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("💷 Wochen & Spenden Verwaltung")
                    .setColor(0x00ff99)
            ]
        });
    }

    // =========================
    // 🏦 FINANZ DASHBOARD
    // =========================

    if (message.content === "!finanz") {

        const ch = message.guild.channels.cache.find(c => c.name === "🏦┃Finanz-übersicht");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("add").setLabel("➕ +100k").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("remove").setLabel("➖ -100k").setStyle(ButtonStyle.Danger)
        );

        ch.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🏦 Admin Finanz System")
                    .setColor(0xffcc00)
            ],
            components: [row]
        });
    }
});

// =========================
// 🔘 INTERACTIONS
// =========================

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === "sanktion") {

            const i = Number(interaction.values[0]);
            const s = sanktionen[i];

            data.sanktionen += s.cost;
            data.total += s.cost;

            save();
            updateFinance(interaction.guild);

            return interaction.reply({
                content: `🚫 ${s.name} (${s.cost}$)`,
                ephemeral: true
            });
        }
    }

    if (interaction.isButton()) {

        if (interaction.customId === "bezahlt") {

            return interaction.reply({
                content: "✅ bestätigt",
                ephemeral: true
            });
        }

        if (interaction.customId === "add") {
            data.total += 100000;
            save();
            updateFinance(interaction.guild);

            return interaction.reply({ content: "➕", ephemeral: true });
        }

        if (interaction.customId === "remove") {
            data.total -= 100000;
            save();
            updateFinance(interaction.guild);

            return interaction.reply({ content: "➖", ephemeral: true });
        }
    }
});

// =========================
// 🔑 LOGIN
// =========================

client.login(process.env.TOKEN);