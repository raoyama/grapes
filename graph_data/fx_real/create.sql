CREATE TABLE fx_data_real
(
	id serial,
	ticker text,
	"time" timestamp,
	open double precision,
	high double precision,
	low double precision,
	bid double precision,
	ask double precision,
	CONSTRAINT fx_data_real_pkey PRIMARY KEY (id)
);


--

INSERT INTO fx_data_real(id, ticker, "time", open, high, low, bid, ask) VALUES (1, 'AUDUSD', '2014-10-10 00:00:00', 0.877, 0.877, 0.877, 0.877, 0.877);
INSERT INTO fx_data_real(id, ticker, "time", open, high, low, bid, ask) VALUES (2, 'EURUSD', '2014-10-10 00:00:00', 1.2688, 1.2688, 1.2688, 1.2688, 1.2688);
INSERT INTO fx_data_real(id, ticker, "time", open, high, low, bid, ask) VALUES (3, 'GBPUSD', '2014-10-10 00:00:00', 1.6117, 1.6117, 1.6117, 1.6117, 1.6117);
INSERT INTO fx_data_real(id, ticker, "time", open, high, low, bid, ask) VALUES (4, 'NZDUSD', '2014-10-10 00:00:00', 0.7861, 0.7861, 0.7861, 0.7861, 0.7861);
INSERT INTO fx_data_real(id, ticker, "time", open, high, low, bid, ask) VALUES (5, 'USDCAD', '2014-10-10 00:00:00', 1.1181, 1.1181, 1.1181, 1.1181, 1.1181);
INSERT INTO fx_data_real(id, ticker, "time", open, high, low, bid, ask) VALUES (6, 'USDCHF', '2014-10-10 00:00:00', 0.9542, 0.9542, 0.9542, 0.9542, 0.9542);
INSERT INTO fx_data_real(id, ticker, "time", open, high, low, bid, ask) VALUES (7, 'USDJPY', '2014-10-10 00:00:00', 107.79, 107.79, 107.79, 107.79, 107.79);
