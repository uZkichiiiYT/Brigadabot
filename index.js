// ==========================================
// 🔘 BUTTON SYSTEM
// ==========================================

client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) return;

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

    // ==========================================
    // ✅ SANKTION BEZAHLT
    // ==========================================

    if (interaction.customId === "sanktion_bezahlt") {

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

    // ==========================================
    // ✅ ABMELDUNG GELESEN
    // ==========================================

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