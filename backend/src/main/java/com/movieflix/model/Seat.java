package com.movieflix.model;

/** Represents one physical seat for a given show */
public class Seat {
    private int     id;
    private int     showId;
    private String  rowName;
    private int     seatNumber;
    private String  seatLabel;     // e.g. "A1", "B10"
    private String  seatType;      // "STANDARD" | "PREMIUM"
    private boolean isBooked;

    public Seat() {}

    public int     getId()                { return id;         }
    public void    setId(int id)          { this.id = id;      }

    public int     getShowId()            { return showId;     }
    public void    setShowId(int s)       { this.showId = s;   }

    public String  getRowName()           { return rowName;    }
    public void    setRowName(String r)   { this.rowName = r;  }

    public int     getSeatNumber()        { return seatNumber; }
    public void    setSeatNumber(int n)   { this.seatNumber = n;}

    public String  getSeatLabel()         { return seatLabel;  }
    public void    setSeatLabel(String l) { this.seatLabel = l;}

    public String  getSeatType()          { return seatType;   }
    public void    setSeatType(String t)  { this.seatType = t; }

    public boolean isBooked()             { return isBooked;   }
    public void    setBooked(boolean b)   { this.isBooked = b; }
}
