# Aplikacja do treningu szachowego w stylu fiszek

## Temat pracy

Aplikacja webowa do treningu szachowego wykorzystująca metodę fiszek. Użytkownik rozwiązuje pozycje szachowe, aplikacja sprawdza poprawność ruchów i analizuje błędy. System pozwala na tworzenie własnych zestawów ćwiczeń oraz trening z gotowych pozycji.

---

## Stack technologiczny

### Frontend
- **Next.js 14** - framework React z App Router
- **TypeScript** - typowanie statyczne
- **TailwindCSS** - stylowanie utility-first
- **react-chessboard** - komponent szachownicy
- **chess.js** - logika szachowa, walidacja ruchów, PGN parsing

### Backend (planowany)
- **.NET 8** - framework backendowy
- **Entity Framework Core** - ORM do bazy danych
- **SQL Server/PostgreSQL** - baza danych
- **ASP.NET Core Web API** - REST API
- **JWT Bearer Token** - autoryzacja użytkowników
- **Lichess API** - import partii i pozycji

---

## Szczegółowy opis funkcjonalności

### 1. Strona główna (Home)

**Opis funkcjonalności:**
Strona powitalna z opisem aplikacji i przyciskami nawigacji Responsywny design.

**Interakcje:**
- Kliknięcie "Training Mode" → przejście do `/training-page`
- Kliknięcie "Creation Mode" → przejście do `/creation-page`

![image](https://github.com/user-attachments/assets/d446b1e7-3e74-480e-8dad-e005430533c0)

### 2. Tryb treningu (Training)

#### 2.1 Lista ćwiczeń (ExerciseList)

**Opis funkcjonalności:**
Panel po lewej stronie wyświetlający dostępne ćwiczenia. Zawiera gotowe ćwiczenia (KID, debiuty) oraz własne ćwiczenia zapisane lokalnie.

**Elementy UI:**
- Tytuł "Exercises"
- Lista ćwiczeń z nazwą i kolorem (białe/czarne)
- Przycisk "Random Exercise"
- Scrollbar dla długich list
- Własne ćwiczenia na końcu listy

**Interakcje:**
- Kliknięcie ćwiczenia → załadowanie na szachownicę
- Kliknięcie "Random" → losowe ćwiczenie
- Hover na ćwiczeniu → podświetlenie

**Logika:**
- Zaawansowane Sortowanie alfabetyczne z numeracją
- Zapis ilości poprawnych i błędnych podejść
- Automatyczne ładowanie pierwszego ćwiczenia
- Zapisywanie wyboru w localStorage

![image](https://github.com/user-attachments/assets/84bd74e5-b6c8-4ef2-98aa-ee1ad41b9e97)

#### 2.2 Szachownica treningowa (TrainingBoard)

**Opis funkcjonalności:**
Główny element aplikacji - interaktywna szachownica 700x700px z obsługą ruchów szachowych i walidacją poprawności.

**Elementy UI:**
- Szachownica 700x700px z ramką
- Numery ruchów na dole (1, 2, 3...)
- Informacja o błędach pod szachownicą
- Czerwona ramka przy błędzie (800ms)

**Interakcje:**
- Drag & drop figur
- Automatyczna walidacja ruchów
- Podświetlanie błędów
- Automatyczne ruchy komputera po poprawnym ruchu

**Logika:**
- Sprawdzanie poprawności ruchu względem analizy
- Zliczanie błędów
- Automatyczne przejście do następnego ruchu
- Obsługa końca ćwiczenia

![image](https://github.com/user-attachments/assets/9ddbd3c4-615c-4af7-b787-f934d9df9eb6)


#### 2.3 Panel ustawień (RightPanel)

**Opis funkcjonalności:**
Panel po prawej stronie z ustawieniami treningu i analizą błędów. Podzielony na sekcje: ustawienia, fiszki z błędami, historia ruchów.

**Elementy UI:**

**Sekcja ustawień:**
- "Moves limit" - input numeryczny (0 = do końca)
- "Automatic starting moves" - checkbox
- "Automatic moves up to move" - input numeryczny
- "Hint mode" - checkbox

**Sekcja błędów:**
- Fiszki z błędnymi ruchami
- Liczba błędów
- Przycisk "Show mistakes"

**Sekcja historii:**
- Lista wykonanych ruchów
- Przycisk "Show history"
- Nawigacja strzałkami

**Interakcje:**
- Zmiana ustawień → natychmiastowe zastosowanie
- Kliknięcie ruchu w historii → podgląd pozycji
- Kopiowanie PGN do schowka

**Logika:**
- Synchronizacja limitów (automatic ≤ moves limit)
- Zapisywanie ustawień w localStorage
- Obsługa błędów i statystyk

![image](https://github.com/user-attachments/assets/32a31da0-3fb9-4f26-bb1a-3cd71a92dd31)


#### 2.4 Analiza błędów (Mistakes)

**Opis funkcjonalności:**
Po zakończeniu ćwiczenia wyświetlane są fiszki z błędami. Każda fiszka pokazuje ruch, który użytkownik wykonał błędnie.

**Elementy UI:**
- Karty z błędnymi ruchami
- Informacja "No mistakes! Well done!" przy braku błędów
- Liczba błędów
- Możliwość powtórki błędnych pozycji

**Interakcje:**
- Kliknięcie fiszki → powrót do pozycji z błędem
- Automatyczne przejście do następnego ćwiczenia (tryb random)

**Logika:**
- Zliczanie błędów podczas treningu
- Zapisywanie indeksów błędnych ruchów
- Reset błędów przy zmianie ćwiczenia

#### 2.5 Historia ruchów (MoveHistory)

**Opis funkcjonalności:**
Komponent wyświetlający historię wykonanych ruchów z możliwością nawigacji i kopiowania PGN.

**Elementy UI:**
- Lista ruchów w formacie "1. e4 e5 2. Nf3 Nc6"
- Przycisk "Show history" / "Hide history"
- Przycisk "Copy PGN"
- Informacja o nawigacji strzałkami

**Interakcje:**
- Kliknięcie ruchu → podgląd pozycji
- Strzałki ←/→ → nawigacja po historii
- Kopiowanie PGN → schowek

**Logika:**
- Formatowanie ruchów w pary (białe + czarne)
- Obsługa nieparzystej liczby ruchów
- Synchronizacja z szachownicą

![image](https://github.com/user-attachments/assets/f23d9a9f-b980-4f6f-8fe8-7cc3df5cee8e)


### 3. Tryb tworzenia ćwiczeń (Creation)

#### 3.1 Panel tworzenia ćwiczeń

**Opis funkcjonalności:**
Panel po lewej stronie do tworzenia własnych ćwiczeń. Pozwala na dodanie ćwiczenia z PGN lub aktualnej pozycji.

**Elementy UI:**
- Tytuł "Add your own exercise"
- Input "Exercise name"
- Textarea "Paste your PGN here (optional)"
- Wybór koloru (białe/czarne) z kropkami
- Przycisk "Add PGN Exercise"
- Przycisk "Add Current Position"

**Interakcje:**
- Wpisanie nazwy → walidacja
- Wklejenie PGN → automatyczny preview na szachownicy
- Wybór koloru → zmiana orientacji szachownicy
- Dodanie ćwiczenia → zapisanie w localStorage

**Logika:**
- Walidacja PGN
- Automatyczne ładowanie pozycji
- Zapisywanie w localStorage z unikalnym ID

![image](https://github.com/user-attachments/assets/30d5cf27-17e1-431b-ac8e-07a88b060152)

#### 3.3 2 Drzewo debiutowe (Opening Tree)

**Opis funkcjonalności:**
Panel po prawej stronie wyświetlający popularne ruchy dla aktualnej pozycji. Symuluje drzewo debiutowe z Lichess.

**Elementy UI:**
- Tytuł "Opening Tree"
- Input "Critical threshold"
- Lista popularnych ruchów
- Statystyki: Win%, Draw%, Loss%
- Ewaluacja pozycji

**Interakcje:**
- Kliknięcie ruchu → wykonanie na szachownicy
- Zmiana threshold → filtrowanie ruchów
- Hover na ruchu → podświetlenie

**Logika:**
- Generowanie losowych statystyk
- Symulacja ewaluacji pozycji
- Aktualizacja po każdym ruchu

![image](https://github.com/user-attachments/assets/1cd1dabd-fc20-4125-924a-f6fc9a36ecdd)

#### 3.4 Lista własnych ćwiczeń

**Opis funkcjonalności:**
Sekcja wyświetlająca zapisane własne ćwiczenia z możliwością usuwania i ładowania.

**Elementy UI:**
- Tytuł "Your Custom Exercises"
- Lista ćwiczeń z nazwą i kolorem
- Przycisk "Delete" dla każdego ćwiczenia
- Scrollbar dla długich list

**Interakcje:**
- Kliknięcie ćwiczenia → załadowanie na szachownicę
- Kliknięcie "Delete" → usunięcie z localStorage
- Hover → podświetlenie

**Logika:**
- Odczyt z localStorage
- Usuwanie z localStorage
- Aktualizacja listy po zmianach

![image](https://github.com/user-attachments/assets/0df1cf20-5733-4ad4-a6e1-7a70ed8fab7b)

---

## Integracja z .NET API (cześciowo zaimplementowane)

### Logowanie użytkownika
- Formularz logowania/rejestracji
- JWT Bearer Token
- Zapisywanie ćwiczeń na koncie
- Synchronizacja między urządzeniami
- ![image](https://github.com/user-attachments/assets/5257f450-c602-4721-b1dd-d5d7941bb08f)
- ![image](https://github.com/user-attachments/assets/113153fe-777b-4d17-9d5d-1e30233cddd2)


### Lichess API
- Import partii przez URL/ID
- Pobieranie popularnych ruchów
- Statystyki debiutowe
- OAuth autoryzacja

### .NET Web API Endpoints
- `POST /api/exercises` - zapisywanie ćwiczenia
- `GET /api/exercises` - pobieranie ćwiczeń użytkownika
- `POST /api/progress` - zapisywanie postępów
- `GET /api/lichess/game/{id}` - import partii z Lichess
- `POST /api/auth/login` - logowanie użytkownika
- `POST /api/auth/register` - rejestracja użytkownika

---

**Link do działajcego prototypu:** [https://flashess-client.vercel.app/] 
