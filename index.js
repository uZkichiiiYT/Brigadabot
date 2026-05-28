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
// BOT
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
// DATA
// =========================

let data = {
    sanktionen: 0,
    wochen: 0,
    spenden: 0,
    total: 0
};

// =========================
// SANKTIONEN §1–§19
// =========================

const sanktionen = [
{ name: "§1 Nichterscheinen", cost: 75000 },
{ name: "§2 Funkdisziplin", cost: 200000 },
{ name: "§3 Gewalt", cost: 100000 },
{ name: "§4 Anschießen", cost: 100000 },
{ name: "§5 Inaktivität", cost: 250000 },
{ name: "§6 Respektlosigkeit", cost: 200000 },
{ name: "§7 Befehlsverweigerung", cost: 100000 },
{ name: "§8 Verrat", cost: 500000 },
{ name: "§9 Nichtzahlung +50k", cost: 50000 },
{ name: "§10 Zinken", cost: 90000 },
{ name: "§11 Wochen nicht gezahlt", cost: 50000 },
{ name: "§12 Fehlverhalten", cost: 200000 },
{ name: "§13 Kleidung", cost: 50000 },
{ name: "§14 Fahrzeugdiebstahl", cost: 250000 },
{ name: "§15 Aufstellung ignoriert", cost: 100000 },
{ name: "§16 Sondersanktion", cost: 300000 },
{ name: "§17 Maske", cost: 50000 },
{ name: "§18 Schießen Anwesen", cost: 200000 },
{ name: "§19 Schlagen Anwesen", cost: 100000 }
];

// =========================
// SAVE
// =========================

function save() {
    fs.writeFileSync("./data.json", JSON.stringify(data, null, 2));
}

// =========================
// FINANZ UPDATE
// =========================

async function updateFinance(guild) {

    const ch = guild.channels.cache.find(c => c.name.includes("Finanz"));
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

    // nur EIN embed -> kein spam
    const messages = await ch.messages.fetch({ limit: 10 });
    const old = messages.find(m => m.author.id === client.user.id);

    if (old) {
        old.edit({ embeds: [embed] });
    } else {
        ch.send({ embeds: [embed] });
    }
}

// =========================
// READY
// =========================

client.once(Events.ClientReady, () => {
    console.log(`✅ Online als ${client.user.tag}`);
});

// =========================
// !PANEL SYSTEM
// =========================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return;

        const finanz = message.guild.channels.cache.find(c => c.name.includes("Finanz"));
        const sanktion = message.guild.channels.cache.find(c => c.name.includes("Sanktion"));
        const abmeldung = message.guild.channels.cache.find(c => c.name.includes("Abmelden"));
        const wochen = message.guild.channels.cache.find(c => c.name.includes("Wochen"));

        // =========================
        // 💣 SANKTION PANEL
        // =========================

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

        sanktion.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("💣 Sanktionen Panel")
                    .setColor(0xff0000)
            ],
            components: [menu]
        });

        // =========================
        // 🏦 FINANZ PANEL
        // =========================

        const financeBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("add")
                .setLabel("➕ +100k")
                .setStyle(ButtonStyle.Success),

            new ButtonBuilder()
                .setCustomId("remove")
                .setLabel("➖ -100k")
                .setStyle(ButtonStyle.Danger)
        );

        finanz.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🏦 Finanz System")
                    .setColor(0x00ccff)
            ],
            components: [financeBtn]
        });

        // =========================
        // 🚑 ABMELDUNG
        // =========================

        abmeldung.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚑 Abmeldung System")
                    .setDescription("Klicke um dich abzumelden")
                    .setColor(0x0099ff)
            ]
        });

        // =========================
        // 💷 WOCHEN
        // =========================

        wochen.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("💷 Wochen & Spenden")
                    .setColor(0x00ff99)
            ]
        });

        message.reply("✅ Komplettes Panel erstellt");
    }
});

// =========================
// INTERACTIONS
// =========================

client.on(Events.InteractionCreate, async interaction => {

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === "sanktion") {

            const s = sanktionen[interaction.values[0]];

            data.sanktionen += s.cost;
            data.total += s.cost;

            save();
            updateFinance(interaction.guild);

            return interaction.reply({
                content: `🚫 ${s.name}`,
                ephemeral: true
            });
        }
    }

    if (interaction.isButton()) {

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
// LOGIN
// =========================

client.login(process.env.TOKEN);