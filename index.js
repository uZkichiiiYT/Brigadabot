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

// =====================
// 💰 FINANZEN
// =====================
let sanktionen = 0;
let wochenabgaben = 0;

function financeEmbed() {
    return new EmbedBuilder()
        .setTitle("🏦 Finanz Übersicht")
        .setColor(0x00aaff)
        .addFields(
            { name: "💰 Gesamtkasse", value: `${(sanktionen + wochenabgaben).toLocaleString()}$` },
            { name: "🚫 Sanktionen", value: `${sanktionen.toLocaleString()}$` },
            { name: "💷 Wochenabgaben", value: `${wochenabgaben.toLocaleString()}$` }
        )
        .setFooter({ text: "Brigada System" })
        .setTimestamp();
}

// =====================
// 🔄 UPDATE FINANZEN
// =====================
async function updateFinance(guild) {
    const ch = guild.channels.cache.find(c =>
        c.name.includes("finanz")
    );

    if (!ch) return;

    ch.send({
        embeds: [financeEmbed()],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("fin_refresh")
                    .setLabel("🔄 Update")
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId("fin_edit")
                    .setLabel("⚙️ Editor")
                    .setStyle(ButtonStyle.Secondary)
            )
        ]
    });
}

// =====================
// 🟢 START
// =====================
client.once(Events.ClientReady, () => {
    console.log(`Online: ${client.user.tag}`);
});

// =====================
// 📌 PANEL
// =====================
client.on(Events.MessageCreate, async message => {

    if (message.author.bot) return;

    if (message.content === "!panel") {

        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.reply("❌ Keine Rechte");

        await updateFinance(message.guild);

        // 🚑 ABMELDUNG
        const ab = message.guild.channels.cache.find(c =>
            c.name.includes("abmelden")
        );

        if (ab) {
            ab.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🚑 Abmeldesystem")
                        .setColor(0x0099ff)
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("abmelden")
                            .setLabel("📅 Abmelden")
                            .setStyle(ButtonStyle.Primary)
                    )
                ]
            });
        }

        // 💷 WOCHENABGABE → NEUER CHANNEL
        const wk = message.guild.channels.cache.find(c =>
            c.name.includes("Wochenabgabe-verwaltung") ||
            c.name.includes("wochenabgabe-verwaltung")
        );

        if (wk) {
            wk.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("💷 Wochenabgabe Verwaltung")
                        .setColor(0xffff00)
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("week")
                            .setLabel("💷 Abgabe")
                            .setStyle(ButtonStyle.Success)
                    )
                ]
            });
        }

        // 🚫 SANKTION (WIE VORHER)
        const sanc = message.guild.channels.cache.find(c =>
            c.name.includes("sanktion")
        );

        if (sanc) {
            sanc.send({
                embeds: [
                    new EmbedBuilder()
                        .setTitle("🚫 Sanktion System")
                        .setDescription("Schreibe Sanktionen manuell ein wie vorher.")
                        .setColor(0xff0000)
                ],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("sanktion")
                            .setLabel("🚫 Sanktion erstellen")
                            .setStyle(ButtonStyle.Danger)
                    )
                ]
            });
        }

        message.reply("✅ Panel erstellt");
    }
});

// =====================
// 🔘 BUTTONS
// =====================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

    // 📅 ABMELDUNG
    if (interaction.customId === "abmelden") {

        const modal = new ModalBuilder()
            .setCustomId("ab_modal")
            .setTitle("Abmeldung");

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("von").setLabel("Von").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("bis").setLabel("Bis").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("grund").setLabel("Grund").setStyle(TextInputStyle.Paragraph)
            )
        );

        return interaction.showModal(modal);
    }

    // 💷 WOCHENABGABE
    if (interaction.customId === "week") {

        const modal = new ModalBuilder()
            .setCustomId("week_modal")
            .setTitle("Wochenabgabe");

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("amount").setLabel("Betrag").setStyle(TextInputStyle.Short)
            )
        );

        return interaction.showModal(modal);
    }

    // 🔄 FIN UPDATE
    if (interaction.customId === "fin_refresh") {
        return interaction.reply({
            embeds: [financeEmbed()],
            ephemeral: true
        });
    }

    // ⚙️ FIN EDITOR
    if (interaction.customId === "fin_edit") {

        const modal = new ModalBuilder()
            .setCustomId("fin_modal")
            .setTitle("Finanz Editor");

        modal.addComponents(
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("type").setLabel("sanktion / wochen / add / remove").setStyle(TextInputStyle.Short)
            ),
            new ActionRowBuilder().addComponents(
                new TextInputBuilder().setCustomId("amount").setLabel("Betrag").setStyle(TextInputStyle.Short)
            )
        );

        return interaction.showModal(modal);
    }
});

// =====================
// 📝 MODALS
// =====================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    // 💰 FIN EDIT
    if (interaction.customId === "fin_modal") {

        const type = interaction.fields.getTextInputValue("type");
        const amount = Number(interaction.fields.getTextInputValue("amount"));

        if (type === "sanktion") sanktionen += amount;
        else if (type === "wochen") wochenabgaben += amount;
        else if (type === "add") {
            sanktionen += amount;
            wochenabgaben += amount;
        }
        else if (type === "remove") {
            sanktionen -= amount;
            wochenabgaben -= amount;
        }

        await updateFinance(interaction.guild);
        return interaction.reply({ content: "✅ geändert", ephemeral: true });
    }

    // 📅 ABMELDUNG FIX
    if (interaction.customId === "ab_modal") {

        const von = interaction.fields.getTextInputValue("von");
        const bis = interaction.fields.getTextInputValue("bis");
        const grund = interaction.fields.getTextInputValue("grund");

        const ch = interaction.guild.channels.cache.find(c =>
            c.name.includes("Abmelden") || c.name.includes("abmelden")
        );

        if (!ch)
            return interaction.reply({ content: "❌ Channel fehlt", ephemeral: true });

        ch.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("📅 Abmeldung")
                    .addFields(
                        { name: "User", value: `${interaction.user}` },
                        { name: "Von", value: von },
                        { name: "Bis", value: bis },
                        { name: "Grund", value: grund }
                    )
                    .setColor(0x0099ff)
            ]
        });

        return interaction.reply({ content: "✅ gesendet", ephemeral: true });
    }

    // 💷 WOCHENABGABE FIX
    if (interaction.customId === "week_modal") {

        const amount = Number(interaction.fields.getTextInputValue("amount"));
        wochenabgaben += amount;

        const ch = interaction.guild.channels.cache.find(c =>
            c.name.includes("Wochenabgabe-verwaltung")
        );

        if (!ch)
            return interaction.reply({ content: "❌ Channel fehlt", ephemeral: true });

        ch.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("💷 Wochenabgabe")
                    .setDescription(`${amount}$`)
                    .setColor(0xffff00)
            ]
        });

        return interaction.reply({ content: "✅ gespeichert", ephemeral: true });
    }
});

// =====================
// LOGIN
// =====================
client.login(process.env.TOKEN);