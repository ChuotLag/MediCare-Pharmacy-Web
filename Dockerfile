FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY . .
<<<<<<< HEAD
RUN dotnet restore "MediCarePharmacy.slnx"
=======
RUN dotnet restore "MediCarePharmacy.API/MediCarePharmacy.API.csproj"
>>>>>>> 2354933 (Fix Docker restore solution file)
RUN dotnet publish "MediCarePharmacy.API/MediCarePharmacy.API.csproj" -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "MediCarePharmacy.API.dll"]
