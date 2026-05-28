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
} = require('discord.js');

const fs = require('fs');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// =========================
// 💾 FINANZEN DB
// =========================
const DB = "./finance.json";

function getBal() {
    if (!fs.existsSync(DB)) fs.writeFileSync(DB, JSON.stringify({ balance: 0 }));
    return JSON.parse(fs.readFileSync(DB)).balance;
}

function setBal(v) {
    fs.writeFileSync(DB, JSON.stringify({ balance: v }));
}

function addBal(v) {
    const newBal = getBal() + v;
    setBal(newBal);
    return newBal;
}

// =========================
// 🟢 START
// =========================
client.once(Events.ClientReady, () => {
    console.log(`✅ Online als ${client.user.tag}`);
});

// =========================
// 📌 PANEL
// =========================
client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.reply("❌ Keine Rechte");

        // =========================
        // 💰 FINANZEN
        // =========================
        const finance = message.guild.channels.cache.find(ch =>
            ch.name === "💰┃finanz-übersicht"
        );

        if (finance) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setCustomId("fin_add").setLabel("➕ Einzahlen").setStyle(ButtonStyle.Success),
                new ButtonBuilder().setCustomId("fin_remove").setLabel("➖ Abziehen").setStyle(ButtonStyle.Danger),
                new ButtonBuilder().setCustomId("fin_edit").setLabel("✏️ Bearbeiten").setStyle(ButtonStyle.Secondary)
            );

            const embed = new EmbedBuilder()
                .setTitle("🏦 Finanz Übersicht")
                .setDescription(`💰 Gesamtkasse: **${getBal().toLocaleString()}$**`)
                .setColor(0x00ffcc);

            finance.send({ embeds: [embed], components: [row] });
        }

        // =========================
        // 🚑 ABMELDUNG
        // =========================
        const ab = message.guild.channels.cache.find(ch =>
            ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻"
        );

        if (ab) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("abmelden")
                    .setLabel("📅 Abmelden")
                    .setStyle(ButtonStyle.Primary)
            );

            const embed = new EmbedBuilder()
                .setTitle("🚑 Abmeldesystem")
                .setDescription("Klicke für Abmeldung")
                .setColor(0x0099ff);

            ab.send({ embeds: [embed], components: [row] });
        }

        // =========================
        // 💷 WOCHENABGABE
        // =========================
        const week = message.guild.channels.cache.find(ch =>
            ch.name === "💷┃wochenabgabe"
        );

        if (week) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("week_send")
                    .setLabel("💷 Abgeben")
                    .setStyle(ButtonStyle.Success)
            );

            const embed = new EmbedBuilder()
                .setTitle("💷 Wochenabgabe")
                .setDescription("Reiche deine Wochenabgabe ein")
                .setColor(0xffff00);

            week.send({ embeds: [embed], components: [row] });
        }

        message.reply("✅ Panels erstellt");
    }
});

// =========================
// 🔘 BUTTONS
// =========================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // =========================
    // ABMELDUNG
    // =========================
    if (interaction.customId === "abmelden") {

        const modal = new ModalBuilder()
            .setCustomId("abmeldung_modal")
            .setTitle("Abmeldung");

        const von = new TextInputBuilder().setCustomId("von").setLabel("Von").setStyle(TextInputStyle.Short);
        const bis = new TextInputBuilder().setCustomId("bis").setLabel("Bis").setStyle(TextInputStyle.Short);
        const grund = new TextInputBuilder().setCustomId("grund").setLabel("Grund").setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(von),
            new ActionRowBuilder().addComponents(bis),
            new ActionRowBuilder().addComponents(grund)
        );

        return interaction.showModal(modal);
    }

    // =========================
    // WOCHENABGABE
    // =========================
    if (interaction.customId === "week_send") {

        const modal = new ModalBuilder()
            .setCustomId("week_modal")
            .setTitle("Wochenabgabe");

        const amount = new TextInputBuilder()
            .setCustomId("amount")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        const reason = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Info")
            .setStyle(TextInputStyle.Short);

        modal.addComponents(
            new ActionRowBuilder().addComponents(amount),
            new ActionRowBuilder().addComponents(reason)
        );

        return interaction.showModal(modal);
    }
});

// =========================
// 📝 MODALS
// =========================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    // =========================
    // ABMELDUNG
    // =========================
    if (interaction.customId === "abmeldung_modal") {

        const von = interaction.fields.getTextInputValue("von");
        const bis = interaction.fields.getTextInputValue("bis");
        const grund = interaction.fields.getTextInputValue("grund");

        const channel = interaction.guild.channels.cache.find(ch =>
            ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝘂𝗻𝗴-𝐋𝐢𝐬𝐭𝐞"
        );

        const embed = new EmbedBuilder()
            .setTitle("📅 Abmeldung")
            .addFields(
                { name: "User", value: `${interaction.user}` },
                { name: "Von", value: von },
                { name: "Bis", value: bis },
                { name: "Grund", value: grund }
            )
            .setColor(0x0099ff);

        channel.send({ embeds: [embed] });

        return interaction.reply({ content: "✅ Abmeldung gesendet", ephemeral: true });
    }

    // =========================
    // WOCHENABGABE
    // =========================
    if (interaction.customId === "week_modal") {

        const amount = Number(interaction.fields.getTextInputValue("amount"));
        const reason = interaction.fields.getTextInputValue("reason");

        const channel = interaction.guild.channels.cache.find(ch =>
            ch.name === "💷┃wochenabgabe-verwaltung"
        );

        const embed = new EmbedBuilder()
            .setTitle("💷 Wochenabgabe eingereicht")
            .addFields(
                { name: "User", value: `${interaction.user}` },
                { name: "Betrag", value: `${amount}$` },
                { name: "Info", value: reason }
            )
            .setColor(0xffff00);

        channel.send({ embeds: [embed] });

        // 💰 direkt in Finanzen
        addBal(amount);

        return interaction.reply({
            content: "✅ Wochenabgabe gespeichert",
            ephemeral: true
        });
    }
});

// =========================
// LOGIN
// =========================
client.login(process.env.TOKEN);