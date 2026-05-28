//
// ==========================================
// 💰 FINANZ SYSTEM
// ==========================================
//

let familienKasse = 10000000;

let sanktionenGesamt = 0;
let wochenabgabenGesamt = 0;
let freiwilligeSpendenGesamt = 0;

let finanzMessageId = null;

//
// ==========================================
// 💰 FINANZ EMBED UPDATE
// ==========================================
//

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

🚫 Sanktionen:
${sanktionenGesamt.toLocaleString()}$

💷 Wochenabgaben:
${wochenabgabenGesamt.toLocaleString()}$

🤝 Spenden:
${freiwilligeSpendenGesamt.toLocaleString()}$

━━━━━━━━━━━━━━━━━━

📌 Letzte Änderung:
${grund}

👮 Bearbeitet von:
${bearbeiter}
        `)
        .setColor(0x00ff99)
        .setTimestamp();

    // EMBED BEARBEITEN

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

    // ERSTE MESSAGE SENDEN

    const msg = await channel.send({
        embeds: [embed]
    });

    finanzMessageId = msg.id;
}

//
// ==========================================
// 💰 FINANZ BUTTON PANEL
// ==========================================
//

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
            .setLabel("✏️ Finanz bearbeiten")
            .setStyle(ButtonStyle.Primary)
    );

    const embed = new EmbedBuilder()
        .setTitle("💰 Finanz Verwaltung")
        .setDescription(`
💷 Wochenabgaben
🤝 Spenden
✏️ Finanz Änderungen
        `)
        .setColor(0xffff00);

    finanzPanel.send({
        embeds: [embed],
        components: [row]
    });
}

//
// ==========================================
// 🔘 BUTTONS
// ==========================================
//

// ==========================================
// 💷 WOCHENABGABE BUTTON
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
// 🤝 SPENDE BUTTON
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
// ✏️ FINANZ ÄNDERN BUTTON
// ==========================================

if (interaction.customId === "finanz_aendern") {

    const modal = new ModalBuilder()
        .setCustomId("finanz_aendern_modal")
        .setTitle("✏️ Finanz Bearbeiten");

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

//
// ==========================================
// 📝 MODALS
// ==========================================
//

// ==========================================
// 💷 WOCHENABGABE MODAL
// ==========================================

if (interaction.customId === "wochenabgabe_modal") {

    const userInput = interaction.fields.getTextInputValue("user");
    const betrag = parseInt(
        interaction.fields.getTextInputValue("betrag")
    );

    const grund = interaction.fields.getTextInputValue("grund");

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

    wochenabgabenGesamt += betrag;
    familienKasse += betrag;

    await updateFinanzOverview(
        interaction.guild,
        `Wochenabgabe +${betrag}$`,
        interaction.user.tag
    );

    // CHANNEL

    const channel = interaction.guild.channels.cache.find(
        ch => ch.name === "💷┃𝐖𝐨𝐜𝐡𝐞𝐧𝐚𝐛𝐠𝐚𝐛𝐞𝐧"
    );

    const embed = new EmbedBuilder()
        .setTitle("💷 Wochenabgabe")
        .addFields(
            {
                name: "👤 User",
                value: `<@${target.user.id}>`
            },
            {
                name: "💰 Betrag",
                value: `${betrag.toLocaleString()}$`
            },
            {
                name: "📌 Grund",
                value: grund
            }
        )
        .setColor(0xffff00)
        .setTimestamp();

    channel.send({
        embeds: [embed]
    });

    // DM

    const dmMessage = await target.send({
        embeds: [
            new EmbedBuilder()
                .setTitle("💷 Wochenabgabe bezahlt")
                .setDescription(`
💰 Betrag:
${betrag.toLocaleString()}$

📌 Grund:
${grund}

⏰ Nachricht löscht sich nach 4 Tagen.
                `)
                .setColor(0xffff00)
        ]
    }).catch(() => null);

    if (dmMessage) {

        setTimeout(() => {
            dmMessage.delete().catch(() => {});
        }, deleteTime);
    }

    interaction.reply({
        content: "✅ Wochenabgabe eingetragen",
        ephemeral: true
    });
}

// ==========================================
// 🤝 SPENDE MODAL
// ==========================================

if (interaction.customId === "spende_modal") {

    const userInput = interaction.fields.getTextInputValue("user");

    const betrag = parseInt(
        interaction.fields.getTextInputValue("betrag")
    );

    const grund = interaction.fields.getTextInputValue("grund");

    freiwilligeSpendenGesamt += betrag;
    familienKasse += betrag;

    await updateFinanzOverview(
        interaction.guild,
        `Spende +${betrag}$`,
        interaction.user.tag
    );

    interaction.reply({
        content: "✅ Spende eingetragen",
        ephemeral: true
    });
}

// ==========================================
// ✏️ FINANZ ÄNDERN MODAL
// ==========================================

if (interaction.customId === "finanz_aendern_modal") {

    const betrag = parseInt(
        interaction.fields.getTextInputValue("betrag")
    );

    const grund = interaction.fields.getTextInputValue("grund");

    familienKasse += betrag;

    await updateFinanzOverview(
        interaction.guild,
        `Finanz geändert (${betrag}$) | ${grund}`,
        interaction.user.tag
    );

    interaction.reply({
        content: "✅ Finanz geändert",
        ephemeral: true
    });
}