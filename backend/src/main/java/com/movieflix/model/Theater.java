package com.movieflix.model;

/** Represents a cinema theater */
public class Theater {
    private int     id;
    private String  name;
    private String  city;
    private String  address;
    private int     totalScreens;
    private boolean isActive;

    public Theater() {}

    public int     getId()                { return id;           }
    public void    setId(int id)          { this.id = id;        }

    public String  getName()             { return name;          }
    public void    setName(String n)     { this.name = n;        }

    public String  getCity()             { return city;          }
    public void    setCity(String c)     { this.city = c;        }

    public String  getAddress()          { return address;       }
    public void    setAddress(String a)  { this.address = a;     }

    public int     getTotalScreens()     { return totalScreens;  }
    public void    setTotalScreens(int t){ this.totalScreens = t;}

    public boolean isActive()            { return isActive;      }
    public void    setActive(boolean a)  { this.isActive = a;    }
}
