```js
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
    PermissionsBitField
} = require("discord.js");

require("dotenv").config();

// ==========================================
// 🟢 CLIENT
// ==========================================

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ==========================================
// ⏰ DM AUTO DELETE
// ==========================================

const deleteTime = 4 * 24 * 60 * 60 * 1000;

// ==========================================
// 🔐 ROLLEN
// ==========================================

const sanktionRoles = [
    "⌊12⌉ 👑 Chrestnik Leader",
    "⌊11⌉ 👑 Smotriaschi",
    "⌊10⌉ 👑 Glava",
    "⌊.⌉ 👑 Leaderschaft",
    "⌊🚩⌉ Sanktion Verwaltung"
];

const abmeldungRoles = [
    "⌊12⌉ 👑 Chrestnik Leader",
    "⌊11⌉ 👑 Smotriaschi",
    "⌊10⌉ 👑 Glava",
    "⌊.⌉ 👑 Leaderschaft"
];

// ==========================================
// 💰 FINANZEN
// ==========================================

let familienKasse = 10000000;
let sanktionenGesamt = 0;
let wochenabgabenGesamt = 0;
let freiwilligeSpendenGesamt = 0;

let finanzMessageId = null;

// ==========================================
// 💰 FINANZ EMBED
// ==========================================

async function updateFinanzOverview(
    guild,
    grund = "Keine Änderung",
    bearbeiter = "System"
) {

    const channel = guild.channels.cache.find(
        ch => ch.name === "💰┃finanz-übersicht"
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("💰 Brigada Finanzübersicht")
        .setDescription(`
🏦 Gesamtkasse:
${familienKasse.toLocaleString()}$

━━━━━━━━━━━━━━━━━━

📌 Letzte Änderung:
${grund}

👮 Bearbeitet von:
${bearbeiter}
        `)
        .setColor(0x00ff99)
        .setTimestamp();

    if (finanzMessageId) {

        try {

            const oldMessage = await channel.messages.fetch(finanzMessageId);

            await oldMessage.edit({
                embeds: [embed]
            });

            return;

        } catch (err) {
            finanzMessageId = null;
        }
    }

    const msg = await channel.send({
        embeds: [embed]
    });

    finanzMessageId = msg.id;
}

// ==========================================
// 🟢 BOT ONLINE
// ==========================================

client.once(Events.ClientReady, () => {

    console.log(`✅ Bot online als ${client.user.tag}`);
});

// ==========================================
// 👋 WILLKOMMEN
// ==========================================

client.on(Events.GuildMemberAdd, member => {

    const channel = member.guild.channels.cache.find(
        ch => ch.name === "👋┃willkommen"
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("👋 Willkommen bei Brigada")
        .setDescription(`Willkommen ${member}`)
        .setColor(0x000000)
        .setTimestamp();

    channel.send({
        embeds: [embed]
    });
});

// ==========================================
// 📌 PANEL COMMAND
// ==========================================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Keine Rechte");
        }

        // ==========================================
        // 🚑 ABMELDUNG PANEL
        // ==========================================

        const abmeldungPanel = message.guild.channels.cache.find(
            ch => ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻"
        );

        if (abmeldungPanel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("abmeldung")
                    .setLabel("📅 Abmeldung")
                    .setStyle(ButtonStyle.Primary)
            );

            const embed = new EmbedBuilder()
                .setTitle("🚑 Abmeldungs System")
                .setDescription("Klicke unten auf den Button.")
                .setColor(0x0099ff);

            abmeldungPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // ==========================================
        // 🚫 SANKTION PANEL
        // ==========================================

        const sanktionPanel = message.guild.channels.cache.find(
            ch => ch.name === "📓┃𝗦𝗮𝗻𝗸𝗍𝗶𝗼𝗻𝗲𝗻-verwaltung"
        );

        if (sanktionPanel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("sanktion")
                    .setLabel("🚫 Sanktion")
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setTitle("🚫 Sanktions Verwaltung")
                .setDescription("Nur Leaderschaft darf Sanktionen erstellen.")
                .setColor(0xff0000);

            sanktionPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // ==========================================
        // 💰 FINANZ PANEL
        // ==========================================

        const finanzPanel = message.guild.channels.cache.find(
            ch => ch.name === "💷┃𝐖𝐨𝐜𝐡𝐞𝐧𝐚𝐛𝐠𝐚𝐛𝐞-verwaltung"
        );

        if (finanzPanel) {

            const row = new ActionRowBuilder().addComponents(

                new ButtonBuilder()
                    .setCustomId("wochenabgabe")
                    .setLabel("💷 Wochenabgabe")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("spende")
                    .setLabel("🤝 Spende")
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId("finanz_aendern")
                    .setLabel("✏️ Finanz ändern")
                    .setStyle(ButtonStyle.Primary)
            );

            const embed = new EmbedBuilder()
                .setTitle("💰 Finanz Verwaltung")
                .setDescription("Wochenabgaben • Spenden • Finanzänderungen")
                .setColor(0xffff00);

            finanzPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        await updateFinanzOverview(message.guild);

        message.reply("✅ Panels erstellt");
    }
});

// ==========================================
// 🔘 BUTTONS
// ==========================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // ==========================================
    // 🚑 ABMELDUNG
    // ==========================================

    if (interaction.customId === "abmeldung") {

        const modal = new ModalBuilder()
            .setCustomId("abmeldung_modal")
            .setTitle("📅 Abmeldung");

        const von = new TextInputBuilder()
            .setCustomId("von")
            .setLabel("Von")
            .setStyle(TextInputStyle.Short);

        const bis = new TextInputBuilder()
            .setCustomId("bis")
            .setLabel("Bis")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Grund")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(von),
            new ActionRowBuilder().addComponents(bis),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }

    // ==========================================
    // 💷 WOCHENABGABE
    // ==========================================

    if (interaction.customId === "wochenabgabe") {

        const modal = new ModalBuilder()
            .setCustomId("wochenabgabe_modal")
            .setTitle("💷 Wochenabgabe");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("Discord Name")
            .setStyle(TextInputStyle.Short);

        const betrag = new TextInputBuilder()
            .setCustomId("betrag")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Grund")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(betrag),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }

    // ==========================================
    // 🤝 SPENDE
    // ==========================================

    if (interaction.customId === "spende") {

        const modal = new ModalBuilder()
            .setCustomId("spende_modal")
            .setTitle("🤝 Spende");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("Discord Name")
            .setStyle(TextInputStyle.Short);

        const betrag = new TextInputBuilder()
            .setCustomId("betrag")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Grund")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(betrag),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }

    // ==========================================
    // ✏️ FINANZ ÄNDERN
    // ==========================================

    if (interaction.customId === "finanz_aendern") {

        const modal = new ModalBuilder()
            .setCustomId("finanz_aendern_modal")
            .setTitle("✏️ Finanz ändern");

        const betrag = new TextInputBuilder()
            .setCustomId("betrag")
            .setLabel("Betrag (+ oder -)")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Grund")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(betrag),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }
});

// ==========================================
// 🔑 LOGIN
// ==========================================

client.login(process.env.TOKEN);
```
