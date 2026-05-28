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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const deleteTime = 4 * 24 * 60 * 60 * 1000;

// ======================================
// 💰 FINANZEN
// ======================================

let familienKasse = 10000000;
let sanktionenGesamt = 0;
let wochenabgabenGesamt = 0;
let freiwilligeSpendenGesamt = 0;

// ======================================
// 📋 SANKTIONS KATALOG
// ======================================

const sanktionen = {
    "§1": "75.000$",
    "§2": "50.000$ - 350.000$",
    "§3": "100.000$",
    "§4": "100.000$",
    "§5": "250.000$",
    "§6": "50.000$ - 500.000$",
    "§7": "100.000$",
    "§8": "Bloodout",
    "§9": "+50.000$",
    "§10": "90.000$",
    "§11": "50.000$",
    "§12": "100.000$ - 350.000$",
    "§13": "50.000$",
    "§14": "250.000$",
    "§15": "100.000$",
    "§16": "Sondersanktion",
    "§17": "50.000$",
    "§18": "200.000$",
    "§19": "100.000$"
};

// ======================================
// 🔐 ROLLEN
// ======================================

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

// ======================================
// 🟢 BOT ONLINE
// ======================================

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot online als ${client.user.tag}`);
});

// ======================================
// 💰 FINANZ ÜBERSICHT
// ======================================

async function sendFinanzOverview(guild, grund, bearbeiter) {

    const channel = guild.channels.cache.find(
        ch => ch.name === "💰┃finanz-übersicht"
    );

    if (!channel) return;

    const embed = new EmbedBuilder()
        .setTitle("💰 Brigada Finanzübersicht")
        .addFields(
            {
                name: "🏦 Familien Kasse",
                value: `${familienKasse.toLocaleString()}$`
            },
            {
                name: "🚫 Sanktionen",
                value: `${sanktionenGesamt.toLocaleString()}$`,
                inline: true
            },
            {
                name: "💷 Wochenabgaben",
                value: `${wochenabgabenGesamt.toLocaleString()}$`,
                inline: true
            },
            {
                name: "🤝 Spenden",
                value: `${freiwilligeSpendenGesamt.toLocaleString()}$`,
                inline: true
            },
            {
                name: "📌 Letzte Änderung",
                value: grund || "Keine"
            },
            {
                name: "👮 Bearbeitet von",
                value: bearbeiter || "System"
            }
        )
        .setColor(0x00ff99)
        .setTimestamp();

    channel.send({
        embeds: [embed]
    });
}

// ======================================
// 📌 PANEL
// ======================================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Keine Rechte");
        }

        // 🚑 ABMELDUNG

        const abmeldungChannel = message.guild.channels.cache.find(
            ch => ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝗲𝗻"
        );

        if (abmeldungChannel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("abmeldung")
                    .setLabel("📅 Abmeldung")
                    .setStyle(ButtonStyle.Primary)
            );

            const embed = new EmbedBuilder()
                .setTitle("🚑 Abmeldesystem")
                .setDescription("Klicke unten um eine Abmeldung einzureichen.")
                .setColor(0x0099ff);

            abmeldungChannel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // 🚫 SANKTION

        const sanktionChannel = message.guild.channels.cache.find(
            ch => ch.name === "📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung"
        );

        if (sanktionChannel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("sanktion")
                    .setLabel("🚫 Sanktion erstellen")
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setTitle("🚫 Sanktionssystem")
                .setDescription("Sanktionen erstellen")
                .setColor(0xff0000);

            sanktionChannel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // 💷 WOCHENABGABE

        const wochenChannel = message.guild.channels.cache.find(
            ch => ch.name === "💷┃𝐖𝐨𝐜𝐡𝐞𝐧𝐚𝐛𝐠𝐚𝐛𝐞-verwaltung"
        );

        if (wochenChannel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("wochenabgabe")
                    .setLabel("💷 Wochenabgabe")
                    .setStyle(ButtonStyle.Secondary),

                new ButtonBuilder()
                    .setCustomId("spende")
                    .setLabel("🤝 Spende")
                    .setStyle(ButtonStyle.Success)
            );

            const embed = new EmbedBuilder()
                .setTitle("💷 Finanzsystem")
                .setDescription("Wochenabgaben & Spenden")
                .setColor(0xffff00);

            wochenChannel.send({
                embeds: [embed],
                components: [row]
            });
        }

        message.reply("✅ Panels erstellt");
    }
});

// ======================================
// 🔘 BUTTONS
// ======================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // ======================================
    // 🚑 ABMELDUNG
    // ======================================

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

    // ======================================
    // 🚫 SANKTION
    // ======================================

    if (interaction.customId === "sanktion") {

        const modal = new ModalBuilder()
            .setCustomId("sanktion_modal")
            .setTitle("🚫 Sanktion");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("Discord Name")
            .setStyle(TextInputStyle.Short);

        const paragraph = new TextInputBuilder()
            .setCustomId("paragraph")
            .setLabel("§ Nummern z.B §1, §5")
            .setStyle(TextInputStyle.Short);

        const erweiterung = new TextInputBuilder()
            .setCustomId("erweiterung")
            .setLabel("Extra Betrag falls nötig")
            .setStyle(TextInputStyle.Short)
            .setRequired(false);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(paragraph),
            new ActionRowBuilder().addComponents(erweiterung)
        );

        await interaction.showModal(modal);
    }
});

// ======================================
// 📝 MODALS
// ======================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    // ======================================
    // 🚑 ABMELDUNG
    // ======================================

    if (interaction.customId === "abmeldung_modal") {

        const von = interaction.fields.getTextInputValue("von");
        const bis = interaction.fields.getTextInputValue("bis");
        const grund = interaction.fields.getTextInputValue("grund");

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝘂𝗻𝗴-𝐋𝐢𝐬𝐞"
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("abmeldung_gelesen")
                .setLabel("✅ Gelesen")
                .setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setTitle("📅 Neue Abmeldung")
            .addFields(
                {
                    name: "👤 User",
                    value: `<@${interaction.user.id}>`
                },
                {
                    name: "📆 Von",
                    value: von,
                    inline: true
                },
                {
                    name: "📆 Bis",
                    value: bis,
                    inline: true
                },
                {
                    name: "📌 Grund",
                    value: grund
                }
            )
            .setColor(0x0099ff)
            .setTimestamp();

        channel.send({
            embeds: [embed],
            components: [row]
        });

        interaction.reply({
            content: "✅ Abmeldung gesendet",
            ephemeral: true
        });
    }

    // ======================================
    // 🚫 SANKTION MODAL
    // ======================================

    if (interaction.customId === "sanktion_modal") {

        const userInput = interaction.fields.getTextInputValue("user");
        const paragraph = interaction.fields.getTextInputValue("paragraph");
        const erweiterung =
            interaction.fields.getTextInputValue("erweiterung") || "Keine";

        const target = interaction.guild.members.cache.find(m =>
            m.user.username.toLowerCase() === userInput.toLowerCase() ||
            m.displayName.toLowerCase() === userInput.toLowerCase()
        );

        if (!target) {
            return interaction.reply({
                content: "❌ User nicht gefunden",
                ephemeral: true
            });
        }

        let text = "";

        paragraph.split(",").forEach(p => {

            const clean = p.trim();

            if (sanktionen[clean]) {
                text += `\n${clean} → ${sanktionen[clean]}`;
            }
        });

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === "🚫┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻"
        );

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("sanktion_bezahlt")
                .setLabel("✅ Bezahlt")
                .setStyle(ButtonStyle.Success)
        );

        const embed = new EmbedBuilder()
            .setTitle("🚫 Neue Sanktion")
            .addFields(
                {
                    name: "👤 User",
                    value: `<@${target.user.id}>`
                },
                {
                    name: "📋 Paragraphen",
                    value: text || "Keine"
                },
                {
                    name: "💰 Erweiterung",
                    value: erweiterung
                },
                {
                    name: "👮 Bearbeitet von",
                    value: `<@${interaction.user.id}>`
                }
            )
            .setColor(0xff0000)
            .setTimestamp();

        channel.send({
            content: `<@${target.user.id}>`,
            embeds: [embed],
            components: [row]
        });

        // DM

        const dmMessage = await target.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚫 Du hast eine Sanktion erhalten")
                    .setDescription(`
${text}

💰 Erweiterung:
${erweiterung}

⏰ Nachricht löscht sich nach 4 Tagen.
                    `)
                    .setColor(0xff0000)
            ]
        }).catch(() => null);

        if (dmMessage) {

            setTimeout(() => {
                dmMessage.delete().catch(() => {});
            }, deleteTime);
        }

        interaction.reply({
            content: "✅ Sanktion erstellt",
            ephemeral: true
        });
    }
});

// ======================================
// 🔘 BESTÄTIGUNGEN
// ======================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // SANKTION BEZAHLT

    if (interaction.customId === "sanktion_bezahlt") {

        sanktionenGesamt += 100000;
        familienKasse += 100000;

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        embed.setFooter({
            text: `✅ Bezahlt bestätigt von ${interaction.user.tag}`
        });

        embed.setColor(0x00ff00);

        await interaction.message.edit({
            embeds: [embed],
            components: []
        });

        await sendFinanzOverview(
            interaction.guild,
            "Sanktion bezahlt",
            interaction.user.tag
        );

        interaction.reply({
            content: "✅ Sanktion bestätigt",
            ephemeral: true
        });
    }

    // ABMELDUNG GELESEN

    if (interaction.customId === "abmeldung_gelesen") {

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        embed.setFooter({
            text: `✅ Gelesen von ${interaction.user.tag}`
        });

        embed.setColor(0x00ff00);

        await interaction.message.edit({
            embeds: [embed],
            components: []
        });

        interaction.reply({
            content: "✅ Abmeldung bestätigt",
            ephemeral: true
        });
    }
});

// ======================================
// 🔑 LOGIN
// ======================================

client.login(process.env.TOKEN);