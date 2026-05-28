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
        .setFooter({ text: "Brigada Finanzsystem" })
        .setTimestamp();
}

async function updateFinance(guild) {
    const ch = guild.channels.cache.find(c => c.name.includes("finanz"));
    if (!ch) return;

    await ch.send({
        embeds: [financeEmbed()],
        components: [
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("fin_update")
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
// 🟢 BOT START
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
        const ab = message.guild.channels.cache.find(c => c.name.includes("abmelden"));
        if (ab) {
            ab.send({
                embeds: [new EmbedBuilder().setTitle("🚑 Abmeldung System").setColor(0x0099ff)],
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

        // 💷 WOCHENABGABE
        const wk = message.guild.channels.cache.find(c => c.name.includes("wochenabgabe"));
        if (wk) {
            wk.send({
                embeds: [new EmbedBuilder().setTitle("💷 Wochenabgabe").setColor(0xffff00)],
                components: [
                    new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId("week")
                            .setLabel("💷 Abgeben")
                            .setStyle(ButtonStyle.Success)
                    )
                ]
            });
        }

        // 🚫 SANKTION
        const sanc = message.guild.channels.cache.find(c => c.name.includes("sanktion"));
        if (sanc) {

            const menu = new StringSelectMenuBuilder()
                .setCustomId("sanktion_select")
                .setPlaceholder("§ auswählen")
                .addOptions(
                    { label: "§1", value: "75000" },
                    { label: "§2", value: "200000" },
                    { label: "§3", value: "100000" },
                    { label: "§5", value: "250000" },
                    { label: "§6", value: "500000" },
                    { label: "§14", value: "250000" },
                    { label: "§18", value: "200000" }
                );

            sanc.send({
                embeds: [new EmbedBuilder().setTitle("🚫 Sanktion System").setColor(0xff0000)],
                components: [new ActionRowBuilder().addComponents(menu)]
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

    // 🔄 FINANZ UPDATE
    if (interaction.customId === "fin_update") {
        return interaction.reply({
            embeds: [financeEmbed()],
            ephemeral: true
        });
    }

    // ⚙️ FINANZ EDITOR (3 & 4 FIX)
    if (interaction.customId === "fin_edit") {

        const modal = new ModalBuilder()
            .setCustomId("fin_modal")
            .setTitle("Finanz Editor");

        const type = new TextInputBuilder()
            .setCustomId("type")
            .setLabel("sanktion / wochen / add / remove")
            .setStyle(TextInputStyle.Short);

        const amount = new TextInputBuilder()
            .setCustomId("amount")
            .setLabel("Betrag")
            .setStyle(TextInputStyle.Short);

        const reason = new TextInputBuilder()
            .setCustomId("reason")
            .setLabel("Grund")
            .setStyle(TextInputStyle.Paragraph);

        modal.addComponents(
            new ActionRowBuilder().addComponents(type),
            new ActionRowBuilder().addComponents(amount),
            new ActionRowBuilder().addComponents(reason)
        );

        return interaction.showModal(modal);
    }

    // 📅 ABMELDEN
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

    // 🚫 SANKTION SELECT
    if (interaction.isStringSelectMenu() && interaction.customId === "sanktion_select") {

        const amount = Number(interaction.values[0]);
        sanktionen += amount;

        interaction.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("🚫 Sanktion")
                    .setDescription(`${amount}$`)
                    .setColor(0xff0000)
            ]
        });

        return interaction.reply({ content: "✅ gespeichert", ephemeral: true });
    }
});

// =====================
// 📝 MODALS
// =====================
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isModalSubmit()) return;

    // ⚙️ FINANZ EDITOR (3 & 4)
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

        await interaction.reply({ content: "✅ aktualisiert", ephemeral: true });
        await updateFinance(interaction.guild);
    }

    // 📅 ABMELDUNG
    if (interaction.customId === "ab_modal") {

        const von = interaction.fields.getTextInputValue("von");
        const bis = interaction.fields.getTextInputValue("bis");
        const grund = interaction.fields.getTextInputValue("grund");

        const ch = interaction.guild.channels.cache.find(c => c.name.includes("abmelden"));

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

        interaction.reply({ content: "✅ gesendet", ephemeral: true });
    }

    // 💷 WOCHENABGABE
    if (interaction.customId === "week_modal") {

        const amount = Number(interaction.fields.getTextInputValue("amount"));
        wochenabgaben += amount;

        const ch = interaction.guild.channels.cache.find(c => c.name.includes("wochenabgabe"));

        ch.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle("💷 Wochenabgabe")
                    .setDescription(`${amount}$`)
                    .setColor(0xffff00)
            ]
        });

        interaction.reply({ content: "✅ gespeichert", ephemeral: true });
    }
});

// =====================
// LOGIN
// =====================
client.login(process.env.TOKEN);