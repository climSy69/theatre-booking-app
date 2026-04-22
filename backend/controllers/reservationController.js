const db = require("../db");

const createReservation = (req, res) => {
    const { showtime_id, guests } = req.body;
    const user_id = req.user.id;
    const selectedShowtimeId = Number(showtime_id);
    const requestedGuests = Number(guests);

    if (!showtime_id || !guests) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (
        !Number.isInteger(selectedShowtimeId) ||
        selectedShowtimeId <= 0 ||
        !Number.isInteger(requestedGuests) ||
        requestedGuests <= 0
    ) {
        return res.status(400).json({
            message: "Invalid booking details"
        });
    }

    db.beginTransaction((err) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        const showtimeQuery = `
            SELECT available_seats
            FROM showtimes
            WHERE showtime_id = ?
            FOR UPDATE
        `;

        db.query(showtimeQuery, [selectedShowtimeId], (err, showtimes) => {
            if (err) {
                return db.rollback(() => {
                    res.status(500).json({ message: "Database error" });
                });
            }

            if (showtimes.length === 0) {
                return db.rollback(() => {
                    res.status(404).json({ message: "Showtime not found" });
                });
            }

            if (showtimes[0].available_seats < requestedGuests) {
                return db.rollback(() => {
                    res.status(400).json({ message: "Not enough available seats" });
                });
            }

            const insertQuery = `
                INSERT INTO reservations (user_id, showtime_id, guests)
                VALUES (?, ?, ?)
            `;

            db.query(insertQuery, [user_id, selectedShowtimeId, requestedGuests], (err, result) => {
                if (err) {
                    return db.rollback(() => {
                        res.status(500).json({ message: "Database error" });
                    });
                }

                const updateShowtimeQuery = `
                    UPDATE showtimes
                    SET available_seats = available_seats - ?
                    WHERE showtime_id = ?
                `;

                db.query(updateShowtimeQuery, [requestedGuests, selectedShowtimeId], (err, result) => {
                    if (err) {
                        return db.rollback(() => {
                            res.status(500).json({ message: "Database error" });
                        });
                    }

                    db.commit((err) => {
                        if (err) {
                            return db.rollback(() => {
                                res.status(500).json({ message: "Database error" });
                            });
                        }

                        res.json({
                            message: "Reservation created successfully"
                        });
                    });
                });
            });
        });
    });
};

const getMyReservations = (req, res) => {
    const user_id = req.user.id;

    const query = `
        SELECT
            reservations.*,
            shows.title AS show_title,
            theatres.name AS theatre_name,
            showtimes.show_date,
            showtimes.show_time,
            showtimes.price
        FROM reservations
        JOIN showtimes ON reservations.showtime_id = showtimes.showtime_id
        JOIN shows ON showtimes.show_id = shows.show_id
        JOIN theatres ON shows.theatre_id = theatres.theatre_id
        WHERE reservations.user_id = ?
        ORDER BY showtimes.show_date, showtimes.show_time
    `;

    db.query(query, [user_id], (err, results) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);
    });
};

const deleteReservation = (req, res) => {
    const reservation_id = req.params.id;
    const user_id = req.user.id;

    const query = `
        DELETE FROM reservations
        WHERE id = ? AND user_id = ?
    `;

    db.query(query, [reservation_id, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Reservation not found or not yours"
            });
        }

        res.json({
            message: "Reservation deleted successfully"
        });
    });
};

const updateReservation = (req, res) => {
    const reservation_id = req.params.id;
    const user_id = req.user.id;

    const { guests } = req.body;
    const requestedGuests = Number(guests);

    if (!guests) {
        return res.status(400).json({
            message: "All fields are required"
        });
    }

    if (!Number.isInteger(requestedGuests) || requestedGuests <= 0) {
        return res.status(400).json({
            message: "Invalid booking details"
        });
    }

    const query = `
        UPDATE reservations
        SET guests = ?
        WHERE id = ? AND user_id = ?
    `;

    db.query(query, [requestedGuests, reservation_id, user_id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Reservation not found or not yours"
            });
        }

        res.json({
            message: "Reservation updated successfully"
        });
    });
};

module.exports = {
    createReservation,
    getMyReservations,
    deleteReservation,
    updateReservation
};
