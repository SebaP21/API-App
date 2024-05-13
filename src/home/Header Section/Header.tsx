import { ChangeEvent, useEffect, useState } from "react";
import "../../Styles/header-section.css";

const API_KEY = "680bab28709755f0c8594626a5697e2d";

type optionType = {
	name: string;
	lat: number;
	lon: number;
};

export type forecastType = {
	name: string;
	country: string;
	sunrise: number;
	sunset: number;
	list: [
		{
			dt: number;
			main: {
				feels_like: number;
				humidity: number;
				pressure: number;
				temp: number;
				temp_max: number;
				temp_min: number;
			};
			weather: [
				{
					main: string;
					icon: string;
					description: string;
				}
			];
			wind: {
				speed: number;
				gust: number;
				deg: number;
			};

			clouds: {
				all: number;
			};
			pop: number;
			visibility: number;
		}
	];
};

export const HeaderSection = () => {
	const [term, setTerm] = useState<string>("");
	const [city, setCity] = useState<optionType | null>(null);
	const [options, setOptions] = useState<[]>([]);
	const [forecast, setForecast] = useState<forecastType | null>(null); // wyłączanie wyszukiwania po if forecast

	const getSearchOptions = (value: string) => {
		fetch(
			`http://api.openweathermap.org/geo/1.0/direct?q=${value.trim()}&limit=5&appid=${API_KEY}`
		)
			.then((res) => res.json())
			.then((data) => setOptions(data))
			.catch((e) => console.log(e));
	};

	const onInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.trim();
		setTerm(value);
		if (value === "") return;

		getSearchOptions(value);
	};

	const getForecast = (city: optionType) => {
		fetch(
			`https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&units=metric&lang=pl&appid=${API_KEY}`
		)
			.then((res) => res.json())
			.then((data) => {
				const foreCastData = {
					...data.city,
					list: data.list.slice(0, 16),
				};
				setForecast(foreCastData);
			})
			.catch((e) => console.log(e));
	};

	const onSubmit = () => {
		if (!city) return;

		getForecast(city);
	};

	const onOptionSelect = (option: optionType) => {
		setCity(option);
	};

	useEffect(() => {
		if (city) {
			setTerm(city.name);
			setOptions([]);
		}
	}, [city]);

	const getSunTime = (time: number): string => {
		const date = new Date(time * 1000);
		let hours = date.getHours().toString();
		let minutes = date.getMinutes().toString();

		if (hours.length <= 1) hours = `0${hours}`;
		if (minutes.length <= 1) minutes = `0${minutes}`;

		return `${hours}:${minutes}`;
	};

	const getVisibilityValue = (number: number): string => {
		if (number <= 50) return "Znakomita widoczność";
		if (number > 50 && number <= 500) return "Lekka mgła";
		if (number > 500 && number <= 2000) return "Mgliście";
		if (number > 2000 && number <= 9000) return "Przewidywana ciężka mgła";

		return "Ciężka mgła";
	};

	const getRainExpect = (value: number): string => {
		if (value <= 0.33) return "Niskie prawdopodobieństwo";
		if (value > 0.33 && value <= 0.66) return "Możliwe opady";

		return "Wysokie prawdopodobieństwo";
	};

	const getHumidityValue = (level: number): string => {
		if (level <= 55) return "Sucho";
		if (level > 55 && level <= 65) return "Średnia wilgotność";

		return "Duża wilgotność";
	};

	return (
		<section className='section header-section'>
			<h1 onClick={() => setForecast(null)}>Weather</h1>
			{forecast && <h3 className='header-city-name'>{forecast.name}</h3>}
			<section className='content'>
				<>
					{!forecast ? (
						<>
							<section className='check-the-weather'>
								<div className='input-section'>
									<input
										type='text'
										placeholder='Podaj nazwę miasta'
										value={term}
										onChange={onInputChange}
									/>

									<button
										className='btn'
										onClick={onSubmit}
									>
										Wyszukaj
									</button>
								</div>
								<div className='options'>
									<ul>
										{options.map((option: optionType, index: number) => (
											<li key={option.name + "-" + index}>
												<button onClick={() => onOptionSelect(option)}>
													{option.name}
												</button>
											</li>
										))}
									</ul>
								</div>
							</section>
						</>
					) : (
						<>
							<section className='basic-info'>
								<div className='basics'>
									<h1>
										{forecast.name} {forecast.country}
									</h1>
									<h2>{Math.round(forecast.list[0].main.temp)}°C</h2>
									<img
										src={`http://openweathermap.org/img/wn/${forecast.list[0].weather[0].icon}@2x.png`}
										alt={forecast.list[0].weather[0].description}
									/>
									<p>{forecast.list[0].weather[0].description}</p>
									<div className='min-max'>
										<p>min: {Math.floor(forecast.list[0].main.temp_min)}°C</p>
										<p>max: {Math.ceil(forecast.list[0].main.temp_max)}°C</p>
									</div>
								</div>

								<div className='all-day'>
									{forecast.list.map((item, i) => (
										<div key={i}>
											<p>
												{i === 0
													? "Teraz"
													: new Date(item.dt * 1000).getHours() + ".00"}
											</p>
											<img
												src={`http://openweathermap.org/img/wn/${forecast.list[0].weather[0].icon}@2x.png`}
												alt={forecast.list[0].weather[0].description}
											/>
											<p>{Math.round(item.main.temp)}°C</p>
										</div>
									))}
								</div>
							</section>
							<div className='detail-weather'>
								<div className='detail-content'>
									<h4>Wschód słońca</h4>
									<h5>{getSunTime(forecast.sunrise)}</h5>
									{getSunTime(forecast.sunrise)}
								</div>
								<div className='detail-content'>
									<h4>Zachód słónca</h4>
									<h5>{getSunTime(forecast.sunset)}</h5>
									{getSunTime(forecast.sunset)}
								</div>
								<div className='detail-content'>
									<h4>Wiatr</h4>
									<h5>{forecast.list[0].wind.speed} KM/H</h5>
									<p>Podmuchy do {forecast.list[0].wind.gust} KM/H</p>
								</div>
								<div className='detail-content'>
									<h4>Odczuwalne</h4>
									<h5>{Math.round(forecast.list[0].main.feels_like)}°C</h5>
									<p>{`Odczuwalnie ${
										Math.round(forecast.list[0].main.feels_like) <
										Math.round(forecast.list[0].main.temp)
											? "chłodniej"
											: "cieplej"
									}`}</p>
								</div>
								<div className='detail-content'>
									<h4>Wilgotność</h4>
									<h5>{forecast.list[0].main.humidity}%</h5>
									<p>{getHumidityValue(forecast.list[0].main.humidity)}</p>
								</div>
								<div className='detail-content'>
									<h4>Opady</h4>
									<h5>{forecast.list[0].pop * 100} %</h5>
									<p>{getRainExpect(forecast.list[0].pop)}</p>
								</div>
								<div className='detail-content'>
									<h4>Ciśnienie</h4>
									<h5>{forecast.list[0].main.pressure} hPa</h5>
									<p></p>
								</div>
								<div className='detail-content'>
									<h4>Widoczność</h4>
									<h5>{forecast.list[0].main.humidity}%</h5>
									<p>{getVisibilityValue(forecast.list[0].main.humidity)}</p>
								</div>
							</div>
						</>
					)}
				</>
			</section>
		</section>
	);
};

// {forecast ? (
// 	<div className='result'>
// 		<p>{forecast.name}</p>
// 	</div>
// ) : (
// 	<div className='input-section'>
// 		<input
// 			type='text'
// 			placeholder='Podaj nazwę miasta'
// 			value={term}
// 			onChange={onInputChange}
// 		/>

// 		<ul className='input-options'>
// 			{options.map((option: optionType, index: number) => (
// 				<li key={option.name + "-" + index}>
// 					<button onClick={() => onOptionSelect(option)}>
// 						{option.name}
// 					</button>
// 				</li>
// 			))}
// 		</ul>
// 		<button
// 			className='btn'
// 			onClick={onSubmit}
// 		>
// 			Wyszukaj
// 		</button>
// 	</div>
// )}
