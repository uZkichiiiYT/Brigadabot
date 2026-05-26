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
} = require('discord.js');

require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

// ========================================
// ⏰ DM AUTO DELETE (4 TAGE)
// ========================================

const deleteTime = 4 * 24 * 60 * 60 * 1000;

// ========================================
// 🔐 ROLLEN
// ========================================

// DARF SANKTIONEN MACHEN
const sanktionRoles = [
    "⌊12⌉ 👑 Chrestnik Leader",
    "⌊11⌉ 👑 Smotriaschi",
    "⌊10⌉ 👑 Glava",
    "⌊.⌉ 👑 Leaderschaft",
    "⌊🚩⌉ Sanktion Verwaltung"
];

// DARF ABMELDUNG BESTÄTIGEN
const abmeldungRoles = [
    "⌊12⌉ 👑 Chrestnik Leader",
    "⌊11⌉ 👑 Smotriaschi",
    "⌊10⌉ 👑 Glava",
    "⌊.⌉ 👑 Leaderschaft"
];

// ========================================
// 🟢 BOT START
// ========================================

client.once(Events.ClientReady, () => {
    console.log(`✅ Bot online als ${client.user.tag}`);
});

// ========================================
// 📌 PANEL COMMAND
// ========================================

client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("❌ Keine Rechte");
        }

        // ========================================
        // 🚑 ABMELDUNG PANEL
        // ========================================

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
                .setDescription("Klicke unten auf den Button um eine Abmeldung einzureichen.")
                .setColor(0x0099ff);

            abmeldungPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        // ========================================
        // 🚫 SANKTION PANEL
        // ========================================

        const sanktionPanel = message.guild.channels.cache.find(
            ch => ch.name === "📓┃𝗦𝗮𝗻𝗸𝘁𝗶𝗼𝗻𝗲𝗻-verwaltung"
        );

        if (sanktionPanel) {

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("sanktion")
                    .setLabel("🚫 Sanktion erstellen")
                    .setStyle(ButtonStyle.Danger)
            );

            const embed = new EmbedBuilder()
                .setTitle("🚫 Sanktions Verwaltung")
                .setDescription("Nur Sanktion Verwaltung & Leaderschaft dürfen Sanktionen erstellen.")
                .setColor(0xff0000);

            sanktionPanel.send({
                embeds: [embed],
                components: [row]
            });
        }

        message.reply("✅ Panels wurden erstellt");
    }
});

// ========================================
// 🔘 BUTTONS
// ========================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // ========================================
    // 🚑 ABMELDUNG BUTTON
    // ========================================

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

    // ========================================
    // 🚫 SANKTION BUTTON
    // ========================================

    if (interaction.customId === "sanktion") {

        const hasRole = interaction.member.roles.cache.some(role =>
            sanktionRoles.includes(role.name)
        );

        if (!hasRole) {
            return interaction.reply({
                content: "❌ Keine Rechte",
                ephemeral: true
            });
        }

        const modal = new ModalBuilder()
            .setCustomId("sanktion_modal")
            .setTitle("🚫 Sanktion");

        const user = new TextInputBuilder()
            .setCustomId("user")
            .setLabel("Discord Name")
            .setStyle(TextInputStyle.Short);

        const geld = new TextInputBuilder()
            .setCustomId("geld")
            .setLabel("Strafe")
            .setStyle(TextInputStyle.Short);

        const grund = new TextInputBuilder()
            .setCustomId("grund")
            .setLabel("Grund")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(user),
            new ActionRowBuilder().addComponents(geld),
            new ActionRowBuilder().addComponents(grund)
        );

        await interaction.showModal(modal);
    }

    // ========================================
    // ✅ ABMELDUNG GELESEN
    // ========================================

    if (interaction.customId === "abmeldung_gelesen") {

        const hasRole = interaction.member.roles.cache.some(role =>
            abmeldungRoles.includes(role.name)
        );

        if (!hasRole) {
            return interaction.reply({
                content: "❌ Keine Rechte",
                ephemeral: true
            });
        }

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

    // ========================================
    // ✅ SANKTION BEZAHLT
    // ========================================

    if (interaction.customId === "sanktion_bezahlt") {

        const hasRole = interaction.member.roles.cache.some(role =>
            sanktionRoles.includes(role.name)
        );

        if (!hasRole) {
            return interaction.reply({
                content: "❌ Keine Rechte",
                ephemeral: true
            });
        }

        const embed = EmbedBuilder.from(interaction.message.embeds[0]);

        embed.setFooter({
            text: `✅ Bezahlt bestätigt von ${interaction.user.tag}`
        });

        embed.setColor(0x00ff00);

        await interaction.message.edit({
            embeds: [embed],
            components: []
        });

        interaction.reply({
            content: "✅ Sanktion bestätigt",
            ephemeral: true
        });
    }
});

// ========================================
// 📝 MODALS
// ========================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    // ========================================
    // 🚑 ABMELDUNG MODAL
    // ========================================

    if (interaction.customId === "abmeldung_modal") {

        const von = interaction.fields.getTextInputValue("von");
        const bis = interaction.fields.getTextInputValue("bis");
        const grund = interaction.fields.getTextInputValue("grund");

        const channel = interaction.guild.channels.cache.find(
            ch => ch.name === "🚑┃𝗔𝗯𝗺𝗲𝗹𝗱𝘂𝗻𝗴-𝐋𝐢𝐬𝐭𝐞"
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

    // ========================================
    // 🚫 SANKTION MODAL
    // ========================================

    if (interaction.customId === "sanktion_modal") {

        const userInput = interaction.fields.getTextInputValue("user");
        const geld = interaction.fields.getTextInputValue("geld");
        const grund = interaction.fields.getTextInputValue("grund");

        // USER SUCHEN
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
                    name: "💰 Strafe",
                    value: `${geld}$`
                },
                {
                    name: "📌 Grund",
                    value: grund
                },
                {
                    name: "👮 Von",
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

        // ========================================
        // 📩 DM NACHRICHT
        // ========================================

        const dmMessage = await target.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚫 Du hast eine Sanktion erhalten")
                    .setDescription(`
💰 Strafe:
${geld}$

📌 Grund:
${grund}

⚠️ Bitte bezahle deine Sanktion.

⏰ Diese Nachricht wird nach 4 Tagen gelöscht.
                    `)
                    .setColor(0xff0000)
            ]
        }).catch(() => null);

        // AUTO DELETE DM
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

// ========================================
// 🔑 LOGIN
// ========================================

client.login(process.env.TOKEN);