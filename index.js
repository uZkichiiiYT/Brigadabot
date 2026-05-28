const {
    Client,
    GatewayIntentBits,
    Events,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    EmbedBuilder,
    PermissionsBitField,
    StringSelectMenuBuilder
} = require("discord.js");

const fs = require("fs");
require("dotenv").config();

// =========================
// 🤖 CLIENT
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

const FILE = "./data.json";

let data = {
    total: 0,
    sanktionen: 0,
    wochen: 0,
    spenden: 0
};

let financeMsg = null;

// =========================
// 💣 SANKTION KATALOG (§1–§19)
// =========================

const sanktionen = [
{ name: "§1 Nichterscheinen", cost: 75000 },
{ name: "§2 Funkdisziplin", cost: 200000 },
{ name: "§3 Gewalt", cost: 100000 },
{ name: "§4 Anschießen", cost: 100000 },
{ name: "§5 Inaktivität", cost: 250000 },
{ name: "§6 Respektlosigkeit", cost: 250000 },
{ name: "§7 Befehlsverweigerung", cost: 100000 },
{ name: "§8 Verrat (Bloodout)", cost: 500000 },
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
// 💾 SAVE / LOAD
// =========================

function save() {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

function load() {
    if (fs.existsSync(FILE)) {
        data = JSON.parse(fs.readFileSync(FILE));
    }
}

// =========================
// 🏦 FINANCE UPDATE (KEIN SPAM)
// =========================

async function updateFinance(guild) {

    const channel = guild.channels.cache.find(ch => ch.name === "🏦┃finanz-übersicht");
    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("🏦 Finanz Übersicht")
        .setColor(0x00ccff)
        .addFields(
            { name: "💰 Gesamtkasse", value: `${data.total}$` },
            { name: "🚫 Sanktionen", value: `${data.sanktionen}$`, inline: true },
            { name: "💷 Wochenabgaben", value: `${data.wochen}$`, inline: true },
            { name: "🎁 Spenden", value: `${data.spenden}$`, inline: true }
        )
        .setTimestamp();

    if (!financeMsg) {
        financeMsg = await channel.send({ embeds: [embed] });
    } else {
        await financeMsg.edit({ embeds: [embed] });
    }
}

// =========================
// 🚀 READY
// =========================

client.once(Events.ClientReady, () => {
    load();
    console.log(`✅ Online als ${client.user.tag}`);
});

// =========================
// 📌 PANEL SYSTEM
// =========================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    // =========================
    // !panel
    // =========================

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return;

        const channel = message.guild.channels.cache.find(ch => ch.name === "🏦┃finanz-übersicht");

        const menu = new ActionRowBuilder().addComponents(
            new StringSelectMenuBuilder()
                .setCustomId("sanktion_select")
                .setPlaceholder("💣 Sanktion auswählen")
                .addOptions(
                    sanktionen.map((s, i) => ({
                        label: s.name,
                        description: `${s.cost}$`,
                        value: String(i)
                    }))
                )
        );

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("bezahlt")
                .setLabel("✅ Bezahlt")
                .setStyle(ButtonStyle.Success)
        );

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("💣 Mafia Panel")
                    .setColor(0xff0000)
            ],
            components: [menu, button]
        });

        message.reply("✅ Panel erstellt");
    }

    // =========================
    // !abmeldung bleibt (UNVERÄNDERT LOGIK)
    // =========================

    if (message.content === "!abmeldung") {

        const channel = message.guild.channels.cache.find(ch => ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("abmeldung_btn")
                .setLabel("📅 Abmelden")
                .setStyle(ButtonStyle.Primary)
        );

        channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚑 Abmeldung System")
                    .setColor(0x0099ff)
            ],
            components: [row]
        });

        message.reply("✅ Abmeldung Panel erstellt");
    }

    // =========================
    // ADMIN DASHBOARD
    // =========================

    if (message.content === "!admin") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return;

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("add_money").setLabel("➕ +100k").setStyle(ButtonStyle.Success),
            new ButtonBuilder().setCustomId("remove_money").setLabel("➖ -100k").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("reset_finance").setLabel("♻ Reset").setStyle(ButtonStyle.Secondary)
        );

        message.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🛠 Admin Finance")
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

    // =========================
    // SANKTION SELECT
    // =========================

    if (interaction.isStringSelectMenu()) {

        if (interaction.customId === "sanktion_select") {

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

    // =========================
    // BUTTONS
    // =========================

    if (interaction.isButton()) {

        // 💳 BEZAHLT
        if (interaction.customId === "bezahlt") {

            const embed = EmbedBuilder.from(interaction.message.embeds[0]);
            embed.setColor(0x00ff00);

            return interaction.update({
                embeds: [embed],
                components: []
            });
        }

        // ➕
        if (interaction.customId === "add_money") {
            data.total += 100000;
            save();
            updateFinance(interaction.guild);

            return interaction.reply({ content: "➕ 100k", ephemeral: true });
        }

        // ➖
        if (interaction.customId === "remove_money") {
            data.total -= 100000;
            save();
            updateFinance(interaction.guild);

            return interaction.reply({ content: "➖ 100k", ephemeral: true });
        }

        // ♻
        if (interaction.customId === "reset_finance") {
            data = { total: 0, sanktionen: 0, wochen: 0, spenden: 0 };

            save();
            updateFinance(interaction.guild);

            return interaction.reply({ content: "♻ Reset fertig", ephemeral: true });
        }

        // 🚑 ABMELDUNG BUTTON (bleibt vorhanden)
        if (interaction.customId === "abmeldung_btn") {

            const modal = new ModalBuilder()
                .setCustomId("abmeldung_modal")
                .setTitle("📅 Abmeldung");

            const grund = new TextInputBuilder()
                .setCustomId("grund")
                .setLabel("Grund")
                .setStyle(TextInputStyle.Paragraph);

            modal.addComponents(new ActionRowBuilder().addComponents(grund));

            return await interaction.showModal(modal);
        }
    }

    // =========================
    // MODALS
    // =========================

    if (interaction.isModalSubmit()) {

        if (interaction.customId === "abmeldung_modal") {

            const grund = interaction.fields.getTextInputValue("grund");

            const channel = interaction.guild.channels.cache.find(ch => ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻-𝐋𝐢𝐬𝐭𝐞");

            const embed = new EmbedBuilder()
                .setTitle("📅 Abmeldung")
                .setDescription(`👤 ${interaction.user}\n📌 ${grund}`)
                .setColor(0x0099ff);

            channel.send({ embeds: [embed] });

            return interaction.reply({ content: "✅ gesendet", ephemeral: true });
        }
    }
});

// =========================
// LOGIN (WICHTIG FIX)
// =========================

client.login(process.env.TOKEN);